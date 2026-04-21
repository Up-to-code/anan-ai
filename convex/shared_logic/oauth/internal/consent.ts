import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { OAUTH_CONSENT_VERSION, OAUTH_SCOPE_LABELS, diffScopes } from "../../../_core/oauth/constants";
import { findProfileByAuthUserId } from "../../agencies/repositories/core";
import {
  requireSelectedOAuthOrganization,
  resolveSelectedOAuthOrganization,
} from "./organizations";
import {
  buildOAuthOwnerContext,
  getAuthorizationRecordForOwner,
  getClientOrThrow,
} from "./helpers";
import { getOrganizationSubjectMapping } from "./subjects";

function requireActiveFlow<T extends { expiresAt: number; usedAt?: number } | null>(
  flow: T,
  now: number,
): Exclude<T, null> {
  if (!flow || flow.expiresAt <= now || flow.usedAt) {
    throw new ConvexError({ code: "INVALID_REQUEST", message: "Authorization flow is expired" });
  }
  return flow as Exclude<T, null>;
}

function buildRequestedScopes(requestedScopes: string[], pendingScopes: string[]) {
  return requestedScopes.map((scope) => ({
    id: scope,
    label: OAUTH_SCOPE_LABELS[scope as keyof typeof OAUTH_SCOPE_LABELS] ?? scope,
    newlyRequested: pendingScopes.includes(scope),
  }));
}

function toExistingAuthorization(authorization: any, organizationName: string, tenantOrgId: string) {
  return authorization
    ? {
        organizationName,
        tenantOrgId,
        grantedScopes: authorization.grantedScopes,
        createdAt: authorization.createdAt,
        updatedAt: authorization.updatedAt,
        lastUsedAt: authorization.lastUsedAt ?? null,
      }
    : null;
}

function mergeGrantedScopes(existingScopes: string[] | undefined, requestedScopes: string[]) {
  return [...new Set([...(existingScopes ?? []), ...requestedScopes])].sort();
}

async function upsertAuthorizationGrant(args: {
  ctx: any;
  existingAuthorization: any;
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerBrokerId?: any;
  ownerREDId?: any;
  clientId: string;
  actorUserId: any;
  grantedScopes: string[];
  now: number;
}) {
  if (args.existingAuthorization) {
    await args.ctx.db.patch(args.existingAuthorization._id, {
      tenantOrgId: args.tenantOrgId,
      ownerType: args.ownerType,
      ownerBrokerId: args.ownerBrokerId,
      ownerREDId: args.ownerREDId,
      grantedScopes: args.grantedScopes,
      offlineAccess: args.grantedScopes.includes("offline_access"),
      consentVersion: OAUTH_CONSENT_VERSION,
      updatedAt: args.now,
      revokedAt: undefined,
      lastUsedAt: args.now,
      approvedByUserId: args.actorUserId,
    });
    return args.existingAuthorization._id;
  }
  return args.ctx.db.insert("oauthAuthorizations", {
    clientId: args.clientId,
    tenantOrgId: args.tenantOrgId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    grantedScopes: args.grantedScopes,
    offlineAccess: args.grantedScopes.includes("offline_access"),
    consentVersion: OAUTH_CONSENT_VERSION,
    createdAt: args.now,
    updatedAt: args.now,
    lastUsedAt: args.now,
    approvedByUserId: args.actorUserId,
  });
}

async function ensureOrganizationSubjectMapping(args: {
  ctx: any;
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerBrokerId?: any;
  ownerREDId?: any;
  clientId: string;
  pairwiseSubject: string;
  now: number;
}) {
  const owner = buildOAuthOwnerContext({
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
  });
  const existingSubject = await getOrganizationSubjectMapping(args.ctx, owner, args.clientId);
  if (existingSubject) return;
  await args.ctx.db.insert("oauthSubjectMappings", {
    clientId: args.clientId,
    tenantOrgId: args.tenantOrgId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    pairwiseSubject: args.pairwiseSubject,
    createdAt: args.now,
  });
}

async function insertAuthCodeAndAudit(args: {
  ctx: any;
  flow: any;
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerBrokerId?: any;
  ownerREDId?: any;
  actorUserId: any;
  clientId: string;
  authorizationId: any;
  codeHash: string;
  expiresAt: number;
  now: number;
  flowId: any;
}) {
  await args.ctx.db.insert("oauthAuthCodes", {
    codeHash: args.codeHash,
    clientId: args.clientId,
    tenantOrgId: args.tenantOrgId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    approvedByUserId: args.actorUserId,
    authorizationId: args.authorizationId,
    redirectUri: args.flow.redirectUri,
    scopes: args.flow.requestedScopes,
    nonce: args.flow.nonce,
    codeChallenge: args.flow.codeChallenge,
    codeChallengeMethod: args.flow.codeChallengeMethod,
    expiresAt: args.expiresAt,
    createdAt: args.now,
  });
  await args.ctx.db.patch(args.flowId, { usedAt: args.now });
  await args.ctx.db.insert("oauthAuditLogs", {
    eventType: "authorize.approved",
    tenantOrgId: args.tenantOrgId,
    ownerType: args.ownerType,
    ownerBrokerId: args.ownerBrokerId,
    ownerREDId: args.ownerREDId,
    clientId: args.clientId,
    userId: args.actorUserId,
    authorizationId: args.authorizationId,
    metadata: { scopes: args.flow.requestedScopes },
    createdAt: args.now,
  });
}

async function issueAuthCodeForExistingAuthorization(args: {
  ctx: any;
  flow: any;
  selectedOrganization: Awaited<ReturnType<typeof requireSelectedOAuthOrganization>>;
  existingAuthorization: any;
  actorUserId: any;
  codeHash: string;
  expiresAt: number;
  now: number;
  flowId: any;
}) {
  await args.ctx.db.patch(args.existingAuthorization._id, {
    lastUsedAt: args.now,
    updatedAt: args.now,
  });
  await args.ctx.db.insert("oauthAuthCodes", {
    codeHash: args.codeHash,
    clientId: args.flow.clientId,
    tenantOrgId: args.selectedOrganization.tenantOrgId,
    ownerType: args.selectedOrganization.ownerType,
    ownerBrokerId: args.selectedOrganization.ownerBrokerId,
    ownerREDId: args.selectedOrganization.ownerREDId,
    approvedByUserId: args.existingAuthorization.approvedByUserId ?? args.actorUserId,
    authorizationId: args.existingAuthorization._id,
    redirectUri: args.flow.redirectUri,
    scopes: args.flow.requestedScopes,
    nonce: args.flow.nonce,
    codeChallenge: args.flow.codeChallenge,
    codeChallengeMethod: args.flow.codeChallengeMethod,
    expiresAt: args.expiresAt,
    createdAt: args.now,
  });
  await args.ctx.db.patch(args.flowId, { usedAt: args.now });
  await args.ctx.db.insert("oauthAuditLogs", {
    eventType: "authorize.reused_existing_grant",
    tenantOrgId: args.selectedOrganization.tenantOrgId,
    ownerType: args.selectedOrganization.ownerType,
    ownerBrokerId: args.selectedOrganization.ownerBrokerId,
    ownerREDId: args.selectedOrganization.ownerREDId,
    clientId: args.flow.clientId,
    userId: args.actorUserId,
    authorizationId: args.existingAuthorization._id,
    metadata: { scopes: args.flow.requestedScopes },
    createdAt: args.now,
  });
}

/**
 * WHY:   The consent page must render org choices and know whether the selected org already approved the app.
 * WHAT:  Returns the pending flow, client details, eligible organizations, and consent status for the selected org.
 * HOW:   Resolves the caller's active organizations, matches the selected tenant org, and compares requested scopes against the org grant.
 */
export const getAuthorizationPrompt = internalQuery({
  args: {
    flowId: v.id("oauthFlowState"),
    authUserId: v.string(),
    selectedTenantOrgId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const flow = requireActiveFlow(await ctx.db.get(args.flowId), Date.now());
    const client = await getClientOrThrow(ctx, flow.clientId);
    const profile = await findProfileByAuthUserId(ctx, args.authUserId);
    const { organizations, selectedOrganization } = await resolveSelectedOAuthOrganization(
      ctx,
      args.authUserId,
      args.selectedTenantOrgId,
    );

    const owner = selectedOrganization
      ? buildOAuthOwnerContext({
          ownerType: selectedOrganization.ownerType,
          ownerBrokerId: selectedOrganization.ownerBrokerId,
          ownerREDId: selectedOrganization.ownerREDId,
          authUserId: args.authUserId,
        })
      : null;
    const authorization = owner
      ? await getAuthorizationRecordForOwner(ctx, owner, flow.clientId)
      : null;
    const pendingScopes = selectedOrganization
      ? diffScopes(flow.requestedScopes, authorization?.grantedScopes ?? [])
      : flow.requestedScopes;
    const requiresOrganizationSelection = organizations.length !== 1 && !selectedOrganization;
    const requiresConsent =
      !selectedOrganization ||
      !authorization ||
      authorization.revokedAt !== undefined ||
      authorization.consentVersion !== OAUTH_CONSENT_VERSION ||
      pendingScopes.length > 0;
    const canApproveSelectedOrganization = selectedOrganization?.role === "manager";
    const managerApprovalRequired = Boolean(
      selectedOrganization && requiresConsent && !canApproveSelectedOrganization,
    );

    return {
      flowId: args.flowId,
      client: {
        clientId: client.clientId,
        name: client.name,
        publisherName: client.publisherName,
        logoUrl: client.logoUrl,
        trusted: client.trusted,
      },
      user: {
        email: profile?.email ?? null,
        name: profile?.name ?? null,
        image: null,
      },
      state: flow.state,
      redirectUri: flow.redirectUri,
      requestedScopes: buildRequestedScopes(flow.requestedScopes, pendingScopes),
      offlineAccess: flow.requestedScopes.includes("offline_access"),
      organizations: organizations.map((organization) => ({
        tenantOrgId: organization.tenantOrgId,
        ownerType: organization.ownerType,
        ownerId: organization.ownerId,
        organizationType: organization.organizationType,
        organizationName: organization.organizationName,
        organizationSlug: organization.organizationSlug,
        role: organization.role,
      })),
      selectedTenantOrgId: selectedOrganization?.tenantOrgId ?? null,
      selectedOrganization: selectedOrganization
        ? {
            tenantOrgId: selectedOrganization.tenantOrgId,
            ownerType: selectedOrganization.ownerType,
            ownerId: selectedOrganization.ownerId,
            organizationType: selectedOrganization.organizationType,
            organizationName: selectedOrganization.organizationName,
            organizationSlug: selectedOrganization.organizationSlug,
            role: selectedOrganization.role,
          }
        : null,
      requiresOrganizationSelection,
      canApproveSelectedOrganization,
      managerApprovalRequired,
      approvalDisabledReason: managerApprovalRequired
        ? "Only an organization manager can approve a new app connection or scope expansion."
        : requiresOrganizationSelection
          ? "Choose an organization to continue."
          : null,
      requiresConsent,
      existingAuthorization: selectedOrganization
        ? toExistingAuthorization(
            authorization,
            selectedOrganization.organizationName,
            selectedOrganization.tenantOrgId,
          )
        : null,
    };
  },
});

/**
 * WHY:   Organization approval must produce a durable org grant and a one-time authorization code atomically.
 * WHAT:  Upserts the selected org grant, stores the org subject mapping, and creates an auth code row.
 * HOW:   Validates the pending flow, enforces manager approval, merges scopes on the org grant, and records approval audit data.
 */
export const persistAuthorizationApproval = internalMutation({
  args: {
    flowId: v.id("oauthFlowState"),
    authUserId: v.string(),
    actorUserId: v.id("users"),
    selectedTenantOrgId: v.string(),
    pairwiseSubject: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const flow = requireActiveFlow(await ctx.db.get(args.flowId), args.now);
    const client = await getClientOrThrow(ctx, flow.clientId);
    const selectedOrganization = await requireSelectedOAuthOrganization(
      ctx,
      args.authUserId,
      args.selectedTenantOrgId,
    );
    if (selectedOrganization.role !== "manager") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Manager role required" });
    }

    const owner = buildOAuthOwnerContext({
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
      authUserId: args.authUserId,
    });
    const existingAuthorization = await getAuthorizationRecordForOwner(ctx, owner, client.clientId);
    const grantedScopes = mergeGrantedScopes(existingAuthorization?.grantedScopes, flow.requestedScopes);
    const authorizationId = await upsertAuthorizationGrant({
      ctx,
      existingAuthorization,
      tenantOrgId: selectedOrganization.tenantOrgId,
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
      clientId: client.clientId,
      actorUserId: args.actorUserId,
      grantedScopes,
      now: args.now,
    });
    await ensureOrganizationSubjectMapping({
      ctx,
      tenantOrgId: selectedOrganization.tenantOrgId,
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
      clientId: client.clientId,
      pairwiseSubject: args.pairwiseSubject,
      now: args.now,
    });
    await insertAuthCodeAndAudit({
      ctx,
      flow,
      tenantOrgId: selectedOrganization.tenantOrgId,
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
      actorUserId: args.actorUserId,
      clientId: client.clientId,
      authorizationId,
      codeHash: args.codeHash,
      expiresAt: args.expiresAt,
      now: args.now,
      flowId: args.flowId,
    });
    return {
      clientId: client.clientId,
      redirectUri: flow.redirectUri,
      state: flow.state,
      scopes: flow.requestedScopes,
      authorizationId,
      tenantOrgId: selectedOrganization.tenantOrgId,
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
    };
  },
});

/**
 * WHY:   Non-manager members still need fresh authorization codes when the organization already approved the app.
 * WHAT:  Reuses an unchanged org grant and issues a new one-time authorization code without altering scopes.
 * HOW:   Validates the selected org membership, checks that no new scopes are pending, then writes only the auth code and audit rows.
 */
export const issueAuthorizationCodeForExistingGrant = internalMutation({
  args: {
    flowId: v.id("oauthFlowState"),
    authUserId: v.string(),
    actorUserId: v.id("users"),
    selectedTenantOrgId: v.string(),
    codeHash: v.string(),
    expiresAt: v.number(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const flow = requireActiveFlow(await ctx.db.get(args.flowId), args.now);
    const selectedOrganization = await requireSelectedOAuthOrganization(
      ctx,
      args.authUserId,
      args.selectedTenantOrgId,
    );
    const owner = buildOAuthOwnerContext({
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
      authUserId: args.authUserId,
    });
    const existingAuthorization = await getAuthorizationRecordForOwner(ctx, owner, flow.clientId);
    if (
      !existingAuthorization ||
      existingAuthorization.revokedAt !== undefined ||
      existingAuthorization.consentVersion !== OAUTH_CONSENT_VERSION
    ) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Manager approval required" });
    }

    const pendingScopes = diffScopes(flow.requestedScopes, existingAuthorization.grantedScopes ?? []);
    if (pendingScopes.length > 0) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Manager approval required" });
    }

    await issueAuthCodeForExistingAuthorization({
      ctx,
      flow,
      selectedOrganization,
      existingAuthorization,
      actorUserId: args.actorUserId,
      codeHash: args.codeHash,
      expiresAt: args.expiresAt,
      now: args.now,
      flowId: args.flowId,
    });
    return {
      clientId: flow.clientId,
      redirectUri: flow.redirectUri,
      state: flow.state,
      scopes: flow.requestedScopes,
      authorizationId: existingAuthorization._id,
      tenantOrgId: selectedOrganization.tenantOrgId,
      ownerType: selectedOrganization.ownerType,
      ownerBrokerId: selectedOrganization.ownerBrokerId,
      ownerREDId: selectedOrganization.ownerREDId,
    };
  },
});

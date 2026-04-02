import { ConvexError, v } from "convex/values";
import { internalMutation, internalQuery, mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import { auditLog } from "../../../auditLog";
import { requireSession } from "../../../_core/security/accessPolicy";
import {
  findProfileByAuthUserId,
  getOwnerId,
  getOrganizationRecord,
} from "./core";
import { requireManagerAccess, requireOrganizationMembership } from "./membership";
import { tenants } from "../../../tenants";
import { createOrganizationForAuthUserRecord } from "./organizationCreation.helpers";
import {
  listOrganizationsForProfile,
  updateOrganizationForOwner,
} from "./organizationProfile.helpers";
import { resolveComplianceRulesetForOwner } from "../../compliance/utils";

const ORGANIZATION_ACCESS_ERROR_MESSAGES = [
  "Organization owner profile required",
  "Organization membership required",
  "Profile not found",
  "Tenant organization required",
  "Tenant organization link required",
  "Broker organization link required",
  "Developer organization link required",
] as const;

function hasOrganizationAccessError(message: string) {
  return ORGANIZATION_ACCESS_ERROR_MESSAGES.some((token) => message.includes(token));
}

function requireTenantOrgId(owner: { tenantOrgId?: string }) {
  if (!owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }
  return owner.tenantOrgId;
}

async function getBeforeUpdateState(ctx: any, owner: any, tenantOrgId: string) {
  return Promise.all([
    tenants.getOrganization(ctx as never, tenantOrgId),
    owner.ownerType === "broker" ? ctx.db.get(owner.ownerBrokerId) : ctx.db.get(owner.ownerREDId),
  ]);
}

async function logOrganizationUpdateAudits(params: {
  ctx: any;
  owner: any;
  actorAuthUserId: string;
  tenantOrgId: string;
  beforeTenantOrg: unknown;
  afterTenantOrg: unknown;
  beforeOwnerRecord: unknown;
  organization: any;
}) {
  const { ctx, owner, actorAuthUserId, tenantOrgId, beforeTenantOrg, afterTenantOrg, beforeOwnerRecord, organization } = params;
  await auditLog.logChange(ctx, {
    action: "organization.updated",
    actorId: actorAuthUserId,
    resourceType: "tenantOrganizations",
    resourceId: tenantOrgId,
    before: beforeTenantOrg,
    after: afterTenantOrg,
    generateDiff: true,
    severity: "info",
    tags: ["organizations", "update"],
  });
  await auditLog.logChange(ctx, {
    action: owner.ownerType === "broker" ? "broker.updated" : "red.updated",
    actorId: actorAuthUserId,
    resourceType: owner.ownerType === "broker" ? "brokers" : "RED",
    resourceId: getOwnerId(owner),
    before: beforeOwnerRecord,
    after: organization,
    generateDiff: true,
    severity: "info",
    tags: ["organizations", owner.ownerType],
  });
}

async function mapOrganizationSummary(ctx: any, owner: any, organization: any) {
  return {
    id: getOwnerId(owner),
    type: owner.ownerType === "broker" ? "broker" : "red",
    name: organization.name,
    slug: organization.slug,
    status: organization.status ?? null,
    isVerified: organization.isVerified === true,
    logoUrl: organization.logoId ? await ctx.storage.getUrl(organization.logoId) : null,
    description: organization.description,
    website: organization.website,
    contactEmail: organization.contactEmail,
    phone: organization.phone,
  } as const;
}

function buildOrganizationVerificationSummary(args: {
  organization: any;
  latestRequest: any | null;
  ruleset: any | null;
}) {
  const submittedData =
    args.latestRequest && typeof args.latestRequest.submittedData === "object" && args.latestRequest.submittedData
      ? args.latestRequest.submittedData
      : null;
  const requirements = Array.isArray(submittedData?.requirements)
    ? submittedData.requirements.filter((entry: unknown): entry is string => typeof entry === "string")
    : [];
  const sourceUrls = Array.isArray(submittedData?.sourceUrls)
    ? submittedData.sourceUrls.filter((entry: unknown): entry is string => typeof entry === "string")
    : [];
  const requiresOrgVerification = args.ruleset?.enforcement?.requireOrgVerification === true;
  const publishingBlocked =
    requiresOrgVerification &&
    args.ruleset?.enforcement?.blockPublish === true &&
    args.organization.isVerified !== true;

  return {
    isVerified: args.organization.isVerified === true,
    currentRequestId: args.latestRequest ? String(args.latestRequest._id) : null,
    currentRequestStatus: args.latestRequest?.currentStatus ?? "not_submitted",
    lastSubmittedAt: args.latestRequest?.submittedAt ?? null,
    lastReviewedAt: args.latestRequest?.reviewedAt ?? null,
    reviewerNotes: args.latestRequest?.reviewerNotes ?? null,
    documentsCount: Array.isArray(args.latestRequest?.attachedDocuments)
      ? args.latestRequest.attachedDocuments.length
      : 0,
    publishingBlocked,
    attachedDocuments: Array.isArray(args.latestRequest?.attachedDocuments)
      ? args.latestRequest.attachedDocuments
      : [],
    requirements,
    sourceUrls,
  } as const;
}

async function getLatestOrganizationVerificationRequest(ctx: any, owner: any) {
  const indexName = owner.ownerType === "broker" ? "subjectBrokerId" : "subjectREDId";
  const indexValue = owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId;
  const requestType = owner.ownerType === "broker" ? "broker" : "RED";

  const requests = await ctx.db
    .query("verificationRequests")
    .withIndex(indexName, (q: any) => q.eq(indexName, indexValue))
    .collect();

  return (
    requests
      .filter((request: any) => request.requestType === requestType)
      .sort((left: any, right: any) => (right.submittedAt ?? 0) - (left.submittedAt ?? 0))[0] ?? null
  );
}

async function buildCurrentOrganizationResponse(ctx: any, owner: any, membership: any) {
  const [organization, { ruleset }, latestVerificationRequest] = await Promise.all([
    getOrganizationRecord(ctx, owner),
    resolveComplianceRulesetForOwner(ctx, owner),
    getLatestOrganizationVerificationRequest(ctx, owner),
  ]);

  if (!organization) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
  }

  return {
    organization: {
      ...(await mapOrganizationSummary(ctx, owner, organization)),
      verificationSummary: buildOrganizationVerificationSummary({
        organization,
        latestRequest: latestVerificationRequest,
        ruleset,
      }),
    },
    membership,
  };
}

/**
 * WHY:   Backend gateways sometimes need to resolve organizations for another auth user directly.
 * WHAT:  Lists organizations linked to the provided auth user id.
 * HOW:   Loads the persisted profile and returns tenant-backed summaries when active.
 */
export const listOrganizationsByAuthUserId = internalQuery({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await findProfileByAuthUserId(ctx, args.authUserId);
    if (!profile || profile.isActive === false) return [];
    return listOrganizationsForProfile(ctx, profile);
  },
});

/**
 * WHY:   Workspace bootstrapping needs the current user's linked organizations.
 * WHAT:  Lists organizations for the currently authenticated user.
 * HOW:   Resolves the persisted current profile and returns tenant-backed summaries when active.
 */
export const listCurrentOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireCurrentProfile(ctx);
    const persistedProfile = await findProfileByAuthUserId(ctx, profile.authUserId);
    if (!persistedProfile || persistedProfile.isActive === false) return [];
    return listOrganizationsForProfile(ctx, persistedProfile);
  },
});

/**
 * WHY:   Workspace root pages need a single organization + membership payload for the current user.
 * WHAT:  Returns the current organization summary plus the user's membership record.
 * HOW:   Reuses membership gating, then maps the owner record into the stable DTO.
 */
export const getCurrentOrganization = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { owner, membership } = await requireOrganizationMembership(ctx);
      return buildCurrentOrganizationResponse(ctx, owner, membership);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (hasOrganizationAccessError(message)) {
        return {
          organization: null,
          membership: null,
          accessError: true as const,
        };
      }
      throw error;
    }
  },
});

/**
 * WHY:   Gateway-owned backoffice flows still need a direct auth-user create mutation during migration.
 * WHAT:  Creates an organization for the provided auth user id.
 * HOW:   Delegates to the shared record helper.
 */
export const createOrganizationForAuthUser = internalMutation({
  args: {
    authUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    name: v.string(),
    type: v.union(v.literal("broker"), v.literal("red")),
  },
  handler: async (ctx, args) => {
    const actor = await requireSession(ctx);
    if (actor.authUserId !== args.authUserId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot create an organization for another user" });
    }
    return createOrganizationForAuthUserRecord(ctx, {
      ...args,
      actorAuthUserId: actor.authUserId,
    });
  },
});

/**
 * WHY:   The workspace onboarding flow needs one current-user create mutation with no exposed auth-user plumbing.
 * WHAT:  Creates an organization for the current authenticated profile.
 * HOW:   Resolves the current profile and delegates to the shared auth-user create helper.
 */
export const createOrganizationForCurrentUser = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("broker"), v.literal("red")),
  },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    return createOrganizationForAuthUserRecord(ctx, {
      authUserId: profile.authUserId,
      email: profile.email,
      displayName: profile.name,
      actorAuthUserId: profile.authUserId,
      ...args,
    });
  },
});

/**
 * WHY:   Organization settings need one manager-gated mutation for editing the current owner's organization summary.
 * WHAT:  Updates the current organization name and returns the normalized summary DTO.
 * HOW:   Requires manager access, updates tenants and broker/RED records, and maps to the stable response shape.
 */
export const updateCurrentOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireManagerAccess(ctx);
    const tenantOrgId = requireTenantOrgId(owner);
    const [beforeTenantOrg, beforeOwnerRecord] = await getBeforeUpdateState(ctx, owner, tenantOrgId);
    await tenants.updateOrganization(ctx as never, profile.authUserId, tenantOrgId, {
      name: args.name,
    });
    const organization = await updateOrganizationForOwner(ctx, {
      owner,
      name: args.name,
      description: args.description,
      website: args.website,
      contactEmail: args.contactEmail,
      phone: args.phone,
    });
    if (!organization) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
    }
    const afterTenantOrg = await tenants.getOrganization(ctx as never, tenantOrgId);
    await logOrganizationUpdateAudits({
      ctx,
      owner,
      actorAuthUserId: profile.authUserId,
      tenantOrgId,
      beforeTenantOrg,
      afterTenantOrg,
      beforeOwnerRecord,
      organization,
    });
    return mapOrganizationSummary(ctx, owner, organization);
  },
});

export { createOrganizationForAuthUserRecord };

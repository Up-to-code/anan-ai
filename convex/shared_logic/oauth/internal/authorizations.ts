import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { OAUTH_SCOPE_LABELS } from "../../../_core/oauth/constants";
import { buildOAuthOwnerContext, getAuthorizationRecordForOwner, getClientOrThrow } from "./helpers";

function mapAuthorizationSummary(authorization: any, client: any) {
  return {
    authorizationId: authorization._id,
    clientId: authorization.clientId,
    tenantOrgId: authorization.tenantOrgId ?? "",
    appName: client.name,
    publisherName: client.publisherName,
    logoUrl: client.logoUrl ?? null,
    grantedScopes: authorization.grantedScopes,
    scopeDetails: authorization.grantedScopes.map((scope: string) => ({
      id: scope,
      label: OAUTH_SCOPE_LABELS[scope as keyof typeof OAUTH_SCOPE_LABELS] ?? scope,
    })),
    offlineAccess: authorization.offlineAccess,
    createdAt: authorization.createdAt,
    updatedAt: authorization.updatedAt,
    lastUsedAt: authorization.lastUsedAt ?? null,
  };
}

/**
 * WHY:   Organization settings need a list of active OAuth app grants for the current org instead of per-user connections.
 * WHAT:  Returns connected apps with permission and last-used metadata for the given organization owner.
 * HOW:   Filters authorizations by broker/RED owner, joins client display data, and omits revoked legacy grants.
 */
export const listAuthorizationsForOwner = internalQuery({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOAuthOwnerContext(args);
    const authorizations = owner.ownerType === "broker"
      ? await ctx.db.query("oauthAuthorizations").withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId)).collect()
      : await ctx.db.query("oauthAuthorizations").withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId)).collect();

    const active = authorizations.filter(
      (authorization) => !authorization.revokedAt && Boolean(authorization.ownerType && authorization.tenantOrgId),
    );
    const clients = await Promise.all(active.map((authorization) => getClientOrThrow(ctx, authorization.clientId)));
    return active
      .map((authorization, index) => mapAuthorizationSummary(authorization, clients[index]!))
      .sort((left, right) => (right.lastUsedAt ?? right.updatedAt) - (left.lastUsedAt ?? left.updatedAt));
  },
});

/**
 * WHY:   Hidden compatibility routes may still need to resolve a single org-owned app grant.
 * WHAT:  Returns one connected app authorization for the given org owner and client id.
 * HOW:   Looks up the org grant by owner/client and joins redirect URIs from the OAuth client record.
 */
export const getAuthorizationDetailForOwner = internalQuery({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const owner = buildOAuthOwnerContext(args);
    const authorization = await getAuthorizationRecordForOwner(ctx, owner, args.clientId);
    if (!authorization || authorization.revokedAt || !authorization.ownerType || !authorization.tenantOrgId) {
      return null;
    }
    const client = await getClientOrThrow(ctx, args.clientId);
    return {
      ...mapAuthorizationSummary(authorization, client),
      redirectUris: client.redirectUris,
    };
  },
});

/**
 * WHY:   Organization managers need one emergency disconnect path for compromised or outdated app grants.
 * WHAT:  Revokes the org's authorization and all refresh tokens for the target client.
 * HOW:   Finds the org grant, revokes its token family rows, and records an organization-scoped audit event.
 */
export const revokeAuthorizationForOwner = internalMutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    clientId: v.string(),
    actorUserId: v.id("users"),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const owner = buildOAuthOwnerContext(args);
    const authorization = await getAuthorizationRecordForOwner(ctx, owner, args.clientId);
    if (!authorization || authorization.revokedAt) {
      return { revoked: false } as const;
    }

    const refreshTokens = await ctx.db
      .query("oauthRefreshTokens")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    await Promise.all(
      refreshTokens
        .filter((token) => token.authorizationId === authorization._id)
        .map((token) => ctx.db.patch(token._id, { revokedAt: args.now })),
    );

    const accessTokens = await ctx.db
      .query("oauthAccessTokens")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .collect();
    await Promise.all(
      accessTokens
        .filter((token) => token.authorizationId === authorization._id)
        .map((token) => ctx.db.patch(token._id, { revokedAt: args.now })),
    );

    await ctx.db.patch(authorization._id, {
      revokedAt: args.now,
      updatedAt: args.now,
    });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "authorization.revoked_by_org_manager",
      tenantOrgId: authorization.tenantOrgId,
      ownerType: authorization.ownerType,
      ownerBrokerId: authorization.ownerBrokerId,
      ownerREDId: authorization.ownerREDId,
      clientId: args.clientId,
      userId: args.actorUserId,
      authorizationId: authorization._id,
      createdAt: args.now,
    });
    return { revoked: true } as const;
  },
});

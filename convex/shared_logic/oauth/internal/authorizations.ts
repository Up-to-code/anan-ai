import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";
import { OAUTH_SCOPE_LABELS } from "../../../_core/oauth/constants";
import { getAuthorizationRecord, getClientOrThrow } from "./helpers";

/**
 * WHY:   The security center needs a per-user list of active delegated app grants.
 * WHAT:  Returns connected apps with permission and last-used metadata for the given user.
 * HOW:   Joins authorizations against client records and filters out revoked apps or grants.
 */
export const listAuthorizationsForUser = internalQuery({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const authorizations = await ctx.db
      .query("oauthAuthorizations")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    const active = authorizations.filter((authorization) => !authorization.revokedAt);
    const clients = await Promise.all(active.map((authorization) => getClientOrThrow(ctx, authorization.clientId)));
    return active
      .map((authorization, index) => ({
        authorizationId: authorization._id,
        clientId: authorization.clientId,
        appName: clients[index]!.name,
        publisherName: clients[index]!.publisherName,
        logoUrl: clients[index]!.logoUrl ?? null,
        grantedScopes: authorization.grantedScopes,
        scopeDetails: authorization.grantedScopes.map((scope: string) => ({
          id: scope,
          label: OAUTH_SCOPE_LABELS[scope as keyof typeof OAUTH_SCOPE_LABELS] ?? scope,
        })),
        offlineAccess: authorization.offlineAccess,
        createdAt: authorization.createdAt,
        updatedAt: authorization.updatedAt,
        lastUsedAt: authorization.lastUsedAt ?? null,
      }))
      .sort((left, right) => (right.lastUsedAt ?? right.updatedAt) - (left.lastUsedAt ?? left.updatedAt));
  },
});

/**
 * WHY:   Security UI needs an app-specific detail view with all current grant metadata.
 * WHAT:  Returns one connected app authorization for the given user and client.
 * HOW:   Loads the authorization by `(userId, clientId)` and joins the client display fields.
 */
export const getAuthorizationDetailForUser = internalQuery({
  args: {
    userId: v.id("users"),
    clientId: v.string(),
  },
  handler: async (ctx, args) => {
    const authorization = await getAuthorizationRecord(ctx, args.userId, args.clientId);
    if (!authorization || authorization.revokedAt) return null;
    const client = await getClientOrThrow(ctx, args.clientId);
    return {
      authorizationId: authorization._id,
      clientId: authorization.clientId,
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
      redirectUris: client.redirectUris,
    };
  },
});

/**
 * WHY:   Users need a self-service way to disconnect an app from their Anan account.
 * WHAT:  Revokes the user's authorization and all refresh tokens for the target client.
 * HOW:   Finds the grant, revokes its token family rows, and records an audit event.
 */
export const revokeAuthorizationForUser = internalMutation({
  args: {
    userId: v.id("users"),
    clientId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const authorization = await getAuthorizationRecord(ctx, args.userId, args.clientId);
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

    await ctx.db.patch(authorization._id, {
      revokedAt: args.now,
      updatedAt: args.now,
    });
    await ctx.db.insert("oauthAuditLogs", {
      eventType: "authorization.revoked_by_user",
      clientId: args.clientId,
      userId: args.userId,
      authorizationId: authorization._id,
      createdAt: args.now,
    });
    return { revoked: true } as const;
  },
});

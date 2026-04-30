import { ConvexError, v } from "convex/values";
import { mutation } from "../../_generated/server";
import { oauthScopeValidator, redirectUriValidator } from "../../_core/schema/securityValidators";

function getExpectedServiceToken() {
  const token = process.env.ANAN_APP_REGISTRATION_SYNC_TOKEN?.trim();
  if (!token) {
    throw new ConvexError({
      code: "MISCONFIGURED",
      message: "ANAN_APP_REGISTRATION_SYNC_TOKEN is required for oauth client mirror sync.",
    });
  }
  return token;
}

function requireAppRegistrationSyncToken(serviceToken: string) {
  if (serviceToken !== getExpectedServiceToken()) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid app registration sync token." });
  }
}

export const syncOAuthClientMirror = mutation({
  args: {
    serviceToken: v.string(),
    idempotencyKey: v.string(),
    clientId: v.string(),
    clientSecretHash: v.optional(v.string()),
    name: v.string(),
    publisherName: v.string(),
    iconUrl: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
    clientType: v.union(v.literal("public"), v.literal("confidential")),
    redirectUris: v.array(redirectUriValidator),
    allowedScopes: v.array(oauthScopeValidator),
    trusted: v.boolean(),
    isActive: v.boolean(),
    occurredAt: v.number(),
  },
  handler: async (ctx, args) => {
    requireAppRegistrationSyncToken(args.serviceToken);
    const now = Date.now();
    const existing = await ctx.db
      .query("oauthClients")
      .withIndex("clientId", (q) => q.eq("clientId", args.clientId))
      .unique();
    const clientPatch = {
      clientSecretHash: args.clientSecretHash,
      clientName: args.name.trim(),
      name: args.name.trim(),
      publisherName: args.publisherName.trim(),
      iconUrl: args.iconUrl?.trim() || undefined,
      logoUrl: args.logoUrl?.trim() || undefined,
      clientType: args.clientType,
      redirectUris: args.redirectUris,
      allowedScopes: args.allowedScopes,
      trusted: args.trusted,
      isActive: args.isActive,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, clientPatch);
    } else {
      await ctx.db.insert("oauthClients", {
        clientId: args.clientId,
        ...clientPatch,
        createdAt: now,
      });
    }

    await ctx.db.insert("oauthAuditLogs", {
      eventType: "oauth_client_mirror.synced",
      clientId: args.clientId,
      metadata: {
        idempotencyKey: args.idempotencyKey,
        source: "external_apps",
        occurredAt: args.occurredAt,
      },
      createdAt: now,
    });

    return { ok: true, clientId: args.clientId };
  },
});

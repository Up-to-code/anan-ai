import { ConvexError, type GenericId } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import { buildOwnerContext, type OwnerContext } from "../../agencies/repositories/core";

export async function getClientOrThrow(ctx: any, clientId: string) {
  const client = await ctx.db
    .query("oauthClients")
    .withIndex("clientId", (q: any) => q.eq("clientId", clientId))
    .unique();
  if (!client || !client.isActive) {
    throw new ConvexError({ code: "INVALID_CLIENT", message: "Unknown or inactive OAuth client" });
  }
  if (!client.trusted) {
    throw new ConvexError({ code: "INACTIVE_CLIENT", message: "OAuth client is not active for authorization" });
  }
  return client;
}

export function ensureRedirectUri(client: Doc<"oauthClients">, redirectUri: string) {
  if (!client.redirectUris.includes(redirectUri)) {
    throw new ConvexError({ code: "INVALID_REDIRECT_URI", message: "Redirect URI is not registered" });
  }
}

export function ensureScopes(client: Doc<"oauthClients">, requestedScopes: string[]) {
  const allowed = new Set(client.allowedScopes);
  const invalid = requestedScopes.filter((scope) => !allowed.has(scope));
  if (invalid.length > 0) {
    throw new ConvexError({
      code: "INVALID_SCOPE",
      message: `Unsupported scopes requested: ${invalid.join(", ")}`,
    });
  }
}

export function buildOAuthOwnerContext(args: {
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  authUserId?: string;
}) {
  return buildOwnerContext(args);
}

export async function getLegacyAuthorizationRecord(ctx: any, userId: Id<"users">, clientId: string) {
  return ctx.db
    .query("oauthAuthorizations")
    .withIndex("userId_clientId", (q: any) => q.eq("userId", userId).eq("clientId", clientId))
    .first();
}

export async function getAuthorizationRecordForOwner(ctx: any, owner: OwnerContext, clientId: string) {
  return owner.ownerType === "broker"
    ? ctx.db
        .query("oauthAuthorizations")
        .withIndex("ownerBrokerId_clientId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId).eq("clientId", clientId))
        .first()
    : ctx.db
        .query("oauthAuthorizations")
        .withIndex("ownerREDId_clientId", (q: any) => q.eq("ownerREDId", owner.ownerREDId).eq("clientId", clientId))
        .first();
}

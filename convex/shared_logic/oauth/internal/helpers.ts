import { ConvexError, type GenericId } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";

export async function getClientOrThrow(ctx: any, clientId: string) {
  const client = await ctx.db
    .query("oauthClients")
    .withIndex("clientId", (q: any) => q.eq("clientId", clientId))
    .unique();
  if (!client || !client.isActive) {
    throw new ConvexError({ code: "INVALID_CLIENT", message: "Unknown or inactive OAuth client" });
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

export async function getAuthorizationRecord(ctx: any, userId: Id<"users">, clientId: string) {
  return ctx.db
    .query("oauthAuthorizations")
    .withIndex("userId_clientId", (q: any) => q.eq("userId", userId).eq("clientId", clientId))
    .first();
}

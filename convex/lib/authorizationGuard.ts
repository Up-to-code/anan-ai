import { internalQuery } from "../_generated/server";
import { sha256Hex } from "../_core/oauth/crypto";
import { makeFunctionReference } from "convex/server";
import type { GenericId } from "convex/values";
import { ConvexError, v } from "convex/values";

type DbCtx = {
  db: any;
};

type ScopeGuardCtx = {
  runQuery: (queryRef: any, args: Record<string, unknown>) => Promise<any>;
  request?: Request;
  headers?: Headers;
};

type ScopeGrant = {
  actingOrgId?: GenericId<"organizations">;
  authUserId: GenericId<"authUsers">;
  grantId: GenericId<"oauthGrants">;
  tokenId: GenericId<"accessTokens">;
  scopes: string[];
};

const lookupAccessTokenForScopeRef = makeFunctionReference<"query">(
  "lib/authorizationGuard:lookupAccessTokenForScope",
);

function httpError(status: 401 | 403, error: string, message: string): never {
  throw new Response(JSON.stringify({ error, error_description: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function getAuthorizationHeader(ctx: ScopeGuardCtx, request?: Request) {
  return request?.headers.get("authorization")
    ?? ctx.request?.headers.get("authorization")
    ?? ctx.headers?.get("authorization")
    ?? null;
}

/**
 * WHY:   HTTP actions cannot read Convex tables directly, but scope checks need token lookup.
 * WHAT:  Internal query that resolves an access token and its consent grant by tokenHash.
 * HOW:   Uses by_tokenHash for a single token lookup, then follows grantId with ctx.db.get.
 */
export const lookupAccessTokenForScope = internalQuery({
  args: { tokenHash: v.string() },
  handler: async (ctx, args) => {
    const accessToken = await ctx.db
      .query("accessTokens")
      .withIndex("by_tokenHash", (q) => q.eq("tokenHash", args.tokenHash))
      .unique();
    if (!accessToken) return null;
    if (accessToken.revokedAt !== undefined) return null;

    const grant = await ctx.db.get(accessToken.grantId);
    if (!grant) return null;
    if (grant.revokedAt !== undefined) return null;

    return {
      actingOrgId: accessToken.actingOrgId ?? accessToken.orgId,
      authUserId: grant.authUserId,
      grantId: accessToken.grantId,
      tokenId: accessToken._id,
      expiresAt: accessToken.expiresAt,
      scopes: accessToken.scopes,
    };
  },
});

/**
 * WHY:   Brokers may only act on developer inventory after an explicit marketplace grant.
 * WHAT:  Verifies an active broker authorization for propertyId + brokerOrgId.
 * HOW:   Uses a compound authorization index and checks validUntil against the current time.
 */
export async function requireBrokerAuthorization(
  ctx: DbCtx,
  propertyId: GenericId<"properties">,
  brokerOrgId: GenericId<"organizations">,
) {
  const authorization = await ctx.db
    .query("brokerAuthorizations")
    .withIndex("by_propertyId_and_brokerOrgId_and_status", (q: any) =>
      q.eq("propertyId", propertyId).eq("brokerOrgId", brokerOrgId).eq("status", "active"),
    )
    .first();

  if (!authorization || (authorization.validUntil !== undefined && authorization.validUntil <= Date.now())) {
    throw new ConvexError({ code: "NOT_AUTHORIZED", message: "Broker is not authorized for this inventory" });
  }

  return authorization;
}

/**
 * WHY:   Public API HTTP actions must enforce OAuth least-privilege scopes on every request.
 * WHAT:  Reads a bearer token, hashes it, validates expiry and required scope, and returns token context.
 * HOW:   Calls an internal query for token lookup because Convex HTTP actions access DB through runQuery.
 */
export async function requireScope(
  ctx: ScopeGuardCtx,
  scope: string,
  request?: Request,
): Promise<ScopeGrant> {
  const authorization = getAuthorizationHeader(ctx, request);
  if (!authorization?.startsWith("Bearer ")) {
    httpError(401, "invalid_token", "Missing bearer token");
  }

  const bearerToken = authorization.slice("Bearer ".length).trim();
  if (!bearerToken) {
    httpError(401, "invalid_token", "Missing bearer token");
  }

  const tokenHash = await sha256Hex(bearerToken);
  const token = await ctx.runQuery(lookupAccessTokenForScopeRef, { tokenHash });
  if (!token || token.expiresAt <= Date.now()) {
    httpError(401, "invalid_token", "Access token is missing or expired");
  }

  if (!token.scopes.includes(scope)) {
    httpError(403, "insufficient_scope", `Required scope '${scope}' was not granted`);
  }

  return {
    actingOrgId: token.actingOrgId,
    authUserId: token.authUserId,
    grantId: token.grantId,
    tokenId: token.tokenId,
    scopes: token.scopes,
  };
}

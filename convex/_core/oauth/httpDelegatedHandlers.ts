import { httpAction } from "../../_generated/server";
import { verifyJwt } from "./jwt";
import {
  getOauthInternal,
  getTokenFromRequest,
  jsonResponse,
} from "./httpShared";

const oauthInternal = getOauthInternal();

async function resolveDelegatedAccessContext(ctx: any, request: Request) {
  const token = getTokenFromRequest(request);
  const claims = await verifyJwt(token);
  const context = await ctx.runQuery(oauthInternal.getAccessTokenContext, {
    clientId: String(claims.aud),
    jti: String(claims.jti),
  });
  await ctx.runMutation(oauthInternal.touchAccessToken, {
    jti: String(claims.jti),
    now: Date.now(),
  });
  return { claims, context };
}

function hasAnyScope(scopes: string[], required: string[]) {
  return required.some((scope) => scopes.includes(scope));
}

export const handleDelegatedClients = httpAction(async (ctx, request) => {
  try {
    const { claims, context } = await resolveDelegatedAccessContext(ctx, request);

    if (request.method === "GET") {
      if (!hasAnyScope(context.accessToken.scopes, ["clients:read_own", "clients:read"])) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const clients = await ctx.runQuery(oauthInternal.listDelegatedClients, {
        authUserId: String(context.accessToken.userId),
      });
      return jsonResponse({ clients });
    }

    if (request.method === "POST") {
      if (!context.accessToken.scopes.includes("clients:create")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const body = await request.json();
      const created = await ctx.runMutation(oauthInternal.createDelegatedClient, {
        authUserId: String(context.accessToken.userId),
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
        sourceClientId: String(claims.aud),
        name: String(body.name ?? ""),
        phone: typeof body.phone === "string" ? body.phone : undefined,
        email: typeof body.email === "string" ? body.email : undefined,
        notes: typeof body.notes === "string" ? body.notes : undefined,
        now: Date.now(),
      });
      return jsonResponse({ client: created }, 201);
    }

    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

export const handleDelegatedProperties = httpAction(async (ctx, request) => {
  try {
    const context = await resolveDelegatedAccessContext(ctx, request).then((value) => value.context);

    if (request.method === "GET") {
      if (!hasAnyScope(context.accessToken.scopes, ["properties:read_own", "properties:read"])) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const properties = await ctx.runQuery(oauthInternal.listDelegatedProperties, {
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
      });
      return jsonResponse({ properties });
    }

    if (request.method === "POST") {
      if (!context.accessToken.scopes.includes("properties:create_own")) {
        return jsonResponse({ error: "insufficient_scope" }, 403);
      }
      const body = await request.json();
      const property = await ctx.runMutation(oauthInternal.createDelegatedProperty, {
        brokerId: context.profile?.brokerId,
        REDId: context.profile?.REDId,
        title: String(body.title ?? ""),
        address: String(body.address ?? ""),
        price: Number(body.price ?? 0),
        beds: Number(body.beds ?? 0),
        baths: Number(body.baths ?? 0),
        description: String(body.description ?? ""),
        area: typeof body.area === "string" ? body.area : undefined,
        location: typeof body.location === "string" ? body.location : undefined,
      });
      return jsonResponse({ property }, 201);
    }

    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

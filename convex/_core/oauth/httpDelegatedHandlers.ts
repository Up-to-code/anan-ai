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

function insufficientScope() {
  return jsonResponse({ error: "insufficient_scope" }, 403);
}

async function handleDelegatedClientsGet(ctx: any, context: any) {
  if (!hasAnyScope(context.accessToken.scopes, ["clients:read_own", "clients:read"])) {
    return insufficientScope();
  }
  const clients = await ctx.runQuery(oauthInternal.listDelegatedClients, {
    tenantOrgId: String(context.authorization.tenantOrgId),
  });
  return jsonResponse({ clients });
}

async function handleDelegatedClientsPost(ctx: any, request: Request, context: any, claims: any) {
  if (!context.accessToken.scopes.includes("clients:create")) {
    return insufficientScope();
  }
  const body = await request.json();
  const created = await ctx.runMutation(oauthInternal.createDelegatedClient, {
    ownerAuthUserId: String(context.authorization.approvedByUserId ?? context.authorization.tenantOrgId),
    tenantOrgId: String(context.authorization.tenantOrgId),
    brokerId: context.authorization.ownerType === "broker" ? context.authorization.ownerBrokerId : undefined,
    REDId: context.authorization.ownerType === "RED" ? context.authorization.ownerREDId : undefined,
    sourceClientId: String(claims.aud),
    name: String(body.name ?? ""),
    phone: typeof body.phone === "string" ? body.phone : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    notes: typeof body.notes === "string" ? body.notes : undefined,
    now: Date.now(),
  });
  return jsonResponse({ client: created }, 201);
}

async function handleDelegatedPropertiesGet(ctx: any, context: any) {
  if (!hasAnyScope(context.accessToken.scopes, ["properties:read_own", "properties:read"])) {
    return insufficientScope();
  }
  const properties = await ctx.runQuery(oauthInternal.listDelegatedProperties, {
    tenantOrgId: String(context.authorization.tenantOrgId),
  });
  return jsonResponse({ properties });
}

async function handleDelegatedPropertiesPost(ctx: any, request: Request, context: any) {
  if (!context.accessToken.scopes.includes("properties:create_own")) {
    return insufficientScope();
  }
  const body = await request.json();
  const property = await ctx.runMutation(oauthInternal.createDelegatedProperty, {
    tenantOrgId: String(context.authorization.tenantOrgId),
    brokerId: context.authorization.ownerType === "broker" ? context.authorization.ownerBrokerId : undefined,
    REDId: context.authorization.ownerType === "RED" ? context.authorization.ownerREDId : undefined,
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

export const handleDelegatedClients = httpAction(async (ctx, request) => {
  try {
    const { claims, context } = await resolveDelegatedAccessContext(ctx, request);
    if (request.method === "GET") return handleDelegatedClientsGet(ctx, context);
    if (request.method === "POST") return handleDelegatedClientsPost(ctx, request, context, claims);
    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

export const handleDelegatedProperties = httpAction(async (ctx, request) => {
  try {
    const context = await resolveDelegatedAccessContext(ctx, request).then((value) => value.context);
    if (request.method === "GET") return handleDelegatedPropertiesGet(ctx, context);
    if (request.method === "POST") return handleDelegatedPropertiesPost(ctx, request, context);
    return new Response(null, { status: 405 });
  } catch (error) {
    return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
  }
});

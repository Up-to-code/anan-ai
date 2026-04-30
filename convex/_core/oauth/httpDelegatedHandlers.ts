import { httpAction } from "../../_generated/server";
import { z } from "zod/v3";
import { verifyJwt } from "./jwt";
import {
  getOauthInternal,
  getTokenFromRequest,
  JsonRequestError,
  jsonResponse,
  readJsonBody,
} from "./httpShared";

const oauthInternal = getOauthInternal();

const delegatedClientCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  phone: z.string().trim().min(1).max(40).optional(),
  email: z.string().trim().email().max(254).optional(),
  notes: z.string().trim().max(2_000).optional(),
}).strict();

const delegatedPropertyCreateSchema = z.object({
  title: z.string().trim().min(1).max(180),
  address: z.string().trim().min(1).max(260),
  price: z.number().finite().nonnegative().max(1_000_000_000),
  beds: z.number().int().nonnegative().max(100),
  baths: z.number().int().nonnegative().max(100),
  description: z.string().trim().max(5_000).optional(),
  area: z.string().trim().min(1).max(120).optional(),
  location: z.string().trim().min(1).max(260).optional(),
}).strict();

function parseDelegatedBody<T>(schema: z.ZodType<T>, body: unknown): T {
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const message = parsed.error.issues[0]?.message ?? "Invalid request body";
    throw new JsonRequestError(message);
  }
  return parsed.data;
}

function delegatedErrorResponse(error: unknown) {
  if (error instanceof JsonRequestError) {
    return jsonResponse({ error: "invalid_request", error_description: error.message }, error.status);
  }
  return jsonResponse({ error: "invalid_token", error_description: (error as Error).message }, 401);
}

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
  const body = parseDelegatedBody(delegatedClientCreateSchema, await readJsonBody(request));
  const created = await ctx.runMutation(oauthInternal.createDelegatedClient, {
    ownerAuthUserId: String(context.authorization.approvedByUserId ?? context.authorization.tenantOrgId),
    tenantOrgId: String(context.authorization.tenantOrgId),
    brokerId: context.authorization.ownerType === "broker" ? context.authorization.ownerBrokerId : undefined,
    REDId: context.authorization.ownerType === "RED" ? context.authorization.ownerREDId : undefined,
    sourceClientId: String(claims.aud),
    name: body.name,
    phone: body.phone,
    email: body.email,
    notes: body.notes,
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
  const body = parseDelegatedBody(delegatedPropertyCreateSchema, await readJsonBody(request));
  const property = await ctx.runMutation(oauthInternal.createDelegatedProperty, {
    tenantOrgId: String(context.authorization.tenantOrgId),
    brokerId: context.authorization.ownerType === "broker" ? context.authorization.ownerBrokerId : undefined,
    REDId: context.authorization.ownerType === "RED" ? context.authorization.ownerREDId : undefined,
    title: body.title,
    address: body.address,
    price: body.price,
    beds: body.beds,
    baths: body.baths,
    description: body.description ?? "",
    area: body.area,
    location: body.location,
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
    return delegatedErrorResponse(error);
  }
});

export const handleDelegatedProperties = httpAction(async (ctx, request) => {
  try {
    const context = await resolveDelegatedAccessContext(ctx, request).then((value) => value.context);
    if (request.method === "GET") return handleDelegatedPropertiesGet(ctx, context);
    if (request.method === "POST") return handleDelegatedPropertiesPost(ctx, request, context);
    return new Response(null, { status: 405 });
  } catch (error) {
    return delegatedErrorResponse(error);
  }
});

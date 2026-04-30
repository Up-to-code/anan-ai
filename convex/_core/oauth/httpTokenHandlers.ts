import { ACCESS_TOKEN_TTL_MS, REFRESH_TOKEN_TTL_MS, formatScopeString } from "./constants";
import { parseBasicAuth, randomToken, sha256Base64Url, sha256Hex } from "./crypto";
import { formValue, getOauthInternal, issueTokenSet, jsonResponse } from "./httpShared";

const oauthInternal = getOauthInternal();

type RefreshRotationResult =
  | { replayDetected: true }
  | { authorizationExpired: true }
  | {
      replayDetected?: false;
      authorizationExpired?: false;
      tenantOrgId: string;
      ownerType: "broker" | "RED";
      ownerBrokerId?: string;
      ownerREDId?: string;
      pairwiseSubject: string;
      scopes: string[];
    };

export type ParsedTokenRequest = {
  params: URLSearchParams;
  clientId: string | null;
  clientSecretHash?: string;
  grantType: string | null;
};

type AuthorizationCodeExchange = {
  authorizationExpired?: false;
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerBrokerId?: string;
  ownerREDId?: string;
  pairwiseSubject: string;
  scopes: string[];
  nonce?: string | null;
};
type ExpiredAuthorizationResult = { authorizationExpired: true };
type RefreshGrantRotation = Exclude<RefreshRotationResult, { replayDetected: true } | ExpiredAuthorizationResult>;

function getAuthorizationCodeInputs(params: URLSearchParams) {
  const code = formValue(params, "code");
  const redirectUri = formValue(params, "redirect_uri");
  const codeVerifier = formValue(params, "code_verifier");
  if (!code || !redirectUri || !codeVerifier) return null;
  return { code, redirectUri, codeVerifier };
}

async function exchangeAuthorizationCode(
  ctx: any,
  parsed: ParsedTokenRequest & { clientId: string },
  input: { code: string; redirectUri: string; codeVerifier: string }
) {
  const now = Date.now();
  const refreshToken = randomToken(32);
  const accessTokenJti = randomToken(16);
  const exchange = await ctx.runMutation(oauthInternal.exchangeAuthorizationCode, {
    clientId: parsed.clientId,
    clientSecretHash: parsed.clientSecretHash,
    codeHash: await sha256Hex(input.code),
    redirectUri: input.redirectUri,
    codeVerifierChallenge: await sha256Base64Url(input.codeVerifier),
    accessTokenJti,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
    refreshTokenHash: await sha256Hex(refreshToken),
    refreshTokenExpiresAt: now + REFRESH_TOKEN_TTL_MS,
    refreshFamilyId: randomToken(16),
    sessionId: undefined,
    now,
  });
  return { accessTokenJti, exchange, refreshToken };
}

async function issueAuthorizationCodeTokens(clientId: string, accessTokenJti: string, exchange: AuthorizationCodeExchange) {
  const tokens = await issueTokenSet({
    clientId,
    subject: exchange.pairwiseSubject,
    tenantOrgId: exchange.tenantOrgId,
    ownerType: exchange.ownerType,
    ownerId: exchange.ownerType === "broker" ? String(exchange.ownerBrokerId) : String(exchange.ownerREDId),
    scopes: exchange.scopes,
    accessTokenJti,
  });
  return { tokens, scopes: exchange.scopes };
}

function authorizationCodeResponse(args: {
  accessToken: string;
  idToken: string | undefined;
  scopes: string[];
  refreshToken?: string;
}) {
  return jsonResponse({
    access_token: args.accessToken,
    token_type: "Bearer",
    expires_in: Math.floor(ACCESS_TOKEN_TTL_MS / 1000),
    refresh_token: args.refreshToken,
    scope: formatScopeString(args.scopes),
    id_token: args.idToken,
  });
}

async function rotateRefreshToken(ctx: any, parsed: ParsedTokenRequest & { clientId: string }, refreshToken: string) {
  const now = Date.now();
  const nextRefreshToken = randomToken(32);
  const accessTokenJti = randomToken(16);
  const rotated = (await ctx.runMutation(oauthInternal.rotateRefreshToken, {
    clientId: parsed.clientId,
    clientSecretHash: parsed.clientSecretHash,
    refreshTokenHash: await sha256Hex(refreshToken),
    accessTokenJti,
    accessTokenExpiresAt: now + ACCESS_TOKEN_TTL_MS,
    nextRefreshTokenHash: await sha256Hex(nextRefreshToken),
    nextRefreshTokenExpiresAt: now + REFRESH_TOKEN_TTL_MS,
    now,
  })) as RefreshRotationResult;
  return { accessTokenJti, nextRefreshToken, rotated };
}

async function issueRefreshGrantTokens(clientId: string, accessTokenJti: string, rotated: RefreshGrantRotation) {
  const tokens = await issueTokenSet({
    clientId,
    subject: rotated.pairwiseSubject,
    tenantOrgId: rotated.tenantOrgId,
    ownerType: rotated.ownerType,
    ownerId: rotated.ownerType === "broker" ? String(rotated.ownerBrokerId) : String(rotated.ownerREDId),
    scopes: rotated.scopes,
    accessTokenJti,
  });
  return { tokens, scopes: rotated.scopes };
}

export async function parseTokenRequest(request: Request): Promise<ParsedTokenRequest> {
  const contentType = request.headers.get("content-type") ?? "";
  const requestBody = await request.text();
  const body =
    contentType.includes("application/x-www-form-urlencoded")
      ? requestBody
      : new URLSearchParams(requestBody).toString();
  const params = new URLSearchParams(body);
  const basic = parseBasicAuth(request.headers.get("authorization"));
  const clientId = basic?.clientId ?? formValue(params, "client_id");
  const clientSecret = basic?.clientSecret ?? formValue(params, "client_secret");
  return {
    params,
    clientId: clientId ?? null,
    clientSecretHash: clientSecret ? await sha256Hex(clientSecret) : undefined,
    grantType: formValue(params, "grant_type") ?? null,
  };
}

export async function handleAuthorizationCodeGrant(
  ctx: any,
  parsed: ParsedTokenRequest & { clientId: string; grantType: "authorization_code" }
) {
  const input = getAuthorizationCodeInputs(parsed.params);
  if (!input) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  const { accessTokenJti, exchange, refreshToken } = await exchangeAuthorizationCode(ctx, parsed, input);
  if ((exchange as ExpiredAuthorizationResult).authorizationExpired) {
    return jsonResponse({ error: "authorization_expired", error_description: "Organization authorization expired" }, 400);
  }
  const { tokens, scopes } = await issueAuthorizationCodeTokens(parsed.clientId, accessTokenJti, exchange);
  return authorizationCodeResponse({
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    scopes,
    refreshToken: scopes.includes("offline_access") ? refreshToken : undefined,
  });
}

export async function handleRefreshTokenGrant(
  ctx: any,
  parsed: ParsedTokenRequest & { clientId: string; grantType: "refresh_token" }
) {
  const refreshToken = formValue(parsed.params, "refresh_token");
  if (!refreshToken) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }

  const { accessTokenJti, nextRefreshToken, rotated } = await rotateRefreshToken(ctx, parsed, refreshToken);
  if ("replayDetected" in rotated && rotated.replayDetected) {
    return jsonResponse({ error: "invalid_grant", error_description: "Refresh token replay detected" }, 400);
  }
  if ("authorizationExpired" in rotated && rotated.authorizationExpired) {
    return jsonResponse({ error: "authorization_expired", error_description: "Organization authorization expired" }, 400);
  }
  const { tokens, scopes } = await issueRefreshGrantTokens(parsed.clientId, accessTokenJti, rotated);
  return authorizationCodeResponse({
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    scopes,
    refreshToken: nextRefreshToken,
  });
}

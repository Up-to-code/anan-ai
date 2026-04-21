import { internal } from "../../_generated/api";
import {
  ACCESS_TOKEN_TTL_MS,
  formatScopeString,
} from "./constants";
import { parseOAuthSourceApp } from "./consentRouting";
import { getOAuthIssuer, signJwt } from "./jwt";

const ACCESS_TOKEN_TTL_SECONDS = Math.floor(ACCESS_TOKEN_TTL_MS / 1000);

export function getOauthInternal() {
  return internal.shared_logic.oauth.internal;
}

export function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

export function formValue(params: URLSearchParams, key: string) {
  const value = params.get(key);
  return value?.trim() || undefined;
}

export function getRequestedSourceApp(url: URL) {
  return parseOAuthSourceApp(url.searchParams.get("app") ?? url.searchParams.get("source"));
}

export function getTokenFromRequest(request: Request) {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) {
    throw new Error("Missing bearer token");
  }
  return header.slice("Bearer ".length).trim();
}

export function getRequestFingerprint(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

type IssueTokenSetParams = {
  clientId: string;
  subject: string;
  tenantOrgId: string;
  ownerType: "broker" | "RED";
  ownerId: string;
  scopes: string[];
  accessTokenJti: string;
};

export async function issueTokenSet(params: IssueTokenSetParams) {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const expiresAt = nowSeconds + ACCESS_TOKEN_TTL_SECONDS;
  const accessToken = await signJwt({
    iss: getOAuthIssuer(),
    aud: params.clientId,
    sub: params.subject,
    tenant_org_id: params.tenantOrgId,
    owner_type: params.ownerType,
    owner_id: params.ownerId,
    jti: params.accessTokenJti,
    scope: formatScopeString(params.scopes),
    iat: nowSeconds,
    exp: expiresAt,
    azp: params.clientId,
  });
  return { accessToken, idToken: undefined };
}

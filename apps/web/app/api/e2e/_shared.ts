import { NextResponse, type NextRequest } from "next/server";

const PERSONA_IDS = [
  "no-org",
  "broker-onboarding",
  "developer-onboarding",
  "broker-manager",
  "developer-manager",
  "invitee",
  "multi-org-manager",
] as const;

export type E2EPersonaId = (typeof PERSONA_IDS)[number];

export type E2EPersona = {
  id: E2EPersonaId;
  email: string;
  password: string;
};

type ParsedCookie = {
  name: string;
  value: string;
  domain: string;
  path: string;
  expires: number;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "Lax" | "Strict" | "None";
};

function isProductionLike() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

function readRequiredEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : null;
}

function personaEnvPrefix(id: E2EPersonaId) {
  return `E2E_PERSONA_${id.replaceAll("-", "_").toUpperCase()}`;
}

function getSharedSecret(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.toLowerCase().startsWith("bearer ")) {
    return authorization.slice("bearer ".length).trim();
  }
  return request.headers.get("x-e2e-secret")?.trim() ?? request.nextUrl.searchParams.get("secret")?.trim() ?? null;
}

function getCookieDomain(request: NextRequest) {
  const host = request.nextUrl.hostname;
  return host === "localhost" ? "localhost" : host;
}

function normalizeSameSite(value: string | undefined): ParsedCookie["sameSite"] {
  if (value?.toLowerCase() === "strict") return "Strict";
  if (value?.toLowerCase() === "none") return "None";
  return "Lax";
}

function splitSetCookieHeader(headerValue: string | null) {
  if (!headerValue) return [];
  return headerValue.split(/,(?=\s*[^;,=\s]+=)/u).map((value) => value.trim()).filter(Boolean);
}

function parseSetCookie(cookie: string, domain: string): ParsedCookie | null {
  const segments = cookie.split(";").map((segment) => segment.trim()).filter(Boolean);
  const [nameValue, ...attributes] = segments;
  const separatorIndex = nameValue.indexOf("=");
  if (separatorIndex <= 0) return null;

  const name = nameValue.slice(0, separatorIndex);
  const value = nameValue.slice(separatorIndex + 1);
  const attributeMap = new Map<string, string | true>();
  for (const attribute of attributes) {
    const [rawKey, ...rawValue] = attribute.split("=");
    const key = rawKey.trim().toLowerCase();
    attributeMap.set(key, rawValue.length > 0 ? rawValue.join("=").trim() : true);
  }

  const expiresValue = attributeMap.get("expires");
  const expires =
    typeof expiresValue === "string"
      ? Math.floor(Date.parse(expiresValue) / 1000)
      : -1;

  return {
    name,
    value,
    domain,
    path: typeof attributeMap.get("path") === "string" ? String(attributeMap.get("path")) : "/",
    expires: Number.isFinite(expires) ? expires : -1,
    httpOnly: attributeMap.has("httponly"),
    secure: attributeMap.has("secure"),
    sameSite: normalizeSameSite(typeof attributeMap.get("samesite") === "string" ? String(attributeMap.get("samesite")) : undefined),
  };
}

export function listConfiguredPersonas(): Array<{ id: E2EPersonaId; configured: boolean }> {
  return PERSONA_IDS.map((id) => {
    const prefix = personaEnvPrefix(id);
    return {
      id,
      configured: Boolean(readRequiredEnv(`${prefix}_EMAIL`) && readRequiredEnv(`${prefix}_PASSWORD`)),
    };
  });
}

export function readPersona(id: string): E2EPersona | null {
  if (!PERSONA_IDS.includes(id as E2EPersonaId)) return null;
  const personaId = id as E2EPersonaId;
  const prefix = personaEnvPrefix(personaId);
  const email = readRequiredEnv(`${prefix}_EMAIL`);
  const password = readRequiredEnv(`${prefix}_PASSWORD`);
  if (!email || !password) return null;
  return { id: personaId, email, password };
}

export function ensureE2ERequest(request: NextRequest): NextResponse | null {
  if (isProductionLike()) {
    return NextResponse.json({ ok: false, message: "E2E routes are disabled in production." }, { status: 404 });
  }

  if (process.env.E2E_TEST_MODE !== "true") {
    return NextResponse.json({ ok: false, message: "E2E_TEST_MODE=true is required." }, { status: 404 });
  }

  const expectedSecret = readRequiredEnv("E2E_SHARED_SECRET");
  if (!expectedSecret || getSharedSecret(request) !== expectedSecret) {
    return NextResponse.json({ ok: false, message: "Invalid E2E shared secret." }, { status: 403 });
  }

  return null;
}

export function getSetCookies(response: Response, request: NextRequest) {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const rawCookies =
    typeof headers.getSetCookie === "function"
      ? headers.getSetCookie()
      : splitSetCookieHeader(response.headers.get("set-cookie"));
  const domain = getCookieDomain(request);
  return rawCookies
    .map((cookie) => ({
      raw: cookie,
      parsed: parseSetCookie(cookie, domain),
    }))
    .filter((cookie): cookie is { raw: string; parsed: ParsedCookie } => Boolean(cookie.parsed));
}

export function appendSetCookies(response: NextResponse, cookies: Array<{ raw: string }>) {
  for (const cookie of cookies) {
    response.headers.append("set-cookie", cookie.raw);
  }
}

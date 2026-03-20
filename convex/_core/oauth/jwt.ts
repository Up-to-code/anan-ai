import { base64UrlEncode, getRequiredEnv, pemToArrayBuffer } from "./crypto";

type JwtPayload = Record<string, string | number | boolean | null | undefined>;

const encoder = new TextEncoder();

let privateKeyPromise: Promise<CryptoKey> | null = null;
let publicKeyPromise: Promise<CryptoKey> | null = null;

function getIssuer() {
  return (
    process.env.ANAN_OAUTH_ISSUER?.trim() ??
    process.env.CUSTOM_AUTH_SITE_URL?.trim() ??
    process.env.CONVEX_SITE_URL?.trim() ??
    "https://auth.anan.ai"
  );
}

async function getPrivateKey() {
  if (!privateKeyPromise) {
    privateKeyPromise = crypto.subtle.importKey(
      "pkcs8",
      pemToArrayBuffer(getRequiredEnv("ANAN_OAUTH_PRIVATE_KEY_PEM")),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return privateKeyPromise;
}

async function getPublicKey() {
  if (!publicKeyPromise) {
    publicKeyPromise = crypto.subtle.importKey(
      "spki",
      pemToArrayBuffer(getRequiredEnv("ANAN_OAUTH_PUBLIC_KEY_PEM")),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
  }
  return publicKeyPromise;
}

/**
 * WHY:   Partner apps need Anan-issued JWTs with a verifiable issuer and audience.
 * WHAT:  Signs an RS256 JWT payload using the configured private key.
 * HOW:   Serializes JOSE header and claims, signs the `header.payload` string, and returns compact JWT.
 */
export async function signJwt(payload: JwtPayload): Promise<string> {
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: getRequiredEnv("ANAN_OAUTH_JWK_KID"),
  };
  const encodedHeader = base64UrlEncode(encoder.encode(JSON.stringify(header)));
  const encodedPayload = base64UrlEncode(encoder.encode(JSON.stringify(payload)));
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    await getPrivateKey(),
    encoder.encode(signingInput),
  );
  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`;
}

function decodeBase64UrlToArrayBuffer(input: string): ArrayBuffer {
  const decoded = atobCompat(input);
  const buffer = new ArrayBuffer(decoded.length);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return buffer;
}

function decodeBase64UrlToUint8Array(input: string): Uint8Array {
  return new Uint8Array(decodeBase64UrlToArrayBuffer(input));
}

function parseJwtClaims(payload: string): Record<string, unknown> {
  const decoded = new TextDecoder().decode(decodeBase64UrlToUint8Array(payload));
  return JSON.parse(decoded) as Record<string, unknown>;
}

function validateJwtClaims(claims: Record<string, unknown>) {
  if (claims.iss !== getIssuer()) {
    throw new Error("Invalid JWT issuer");
  }
  if (typeof claims.exp === "number" && claims.exp * 1000 <= Date.now()) {
    throw new Error("JWT expired");
  }
}

/**
 * WHY:   Bearer access tokens must be validated before any delegated data is returned.
 * WHAT:  Verifies an RS256 JWT and returns its parsed payload.
 * HOW:   Splits the compact token, verifies the signature with the configured public key, and parses JSON claims.
 */
export async function verifyJwt(token: string): Promise<Record<string, unknown>> {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) {
    throw new Error("Invalid JWT format");
  }

  const verified = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    await getPublicKey(),
    decodeBase64UrlToArrayBuffer(signature),
    encoder.encode(`${header}.${payload}`),
  );

  if (!verified) {
    throw new Error("Invalid JWT signature");
  }

  const claims = parseJwtClaims(payload);
  validateJwtClaims(claims);
  return claims;
}

/**
 * WHY:   OIDC-compatible clients need a machine-readable public key set.
 * WHAT:  Returns the configured JWKS document.
 * HOW:   Reads the JSON document directly from environment so dev/prod can manage key rotation externally.
 */
export function getJwks() {
  return JSON.parse(getRequiredEnv("ANAN_OAUTH_JWKS_JSON"));
}

/**
 * WHY:   OAuth metadata and access tokens must share the same issuer string.
 * WHAT:  Exposes the configured issuer.
 * HOW:   Uses the same resolution logic as JWT signing and validation.
 */
export function getOAuthIssuer() {
  return getIssuer();
}

function atobCompat(input: string): string {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4 || 4)) % 4);
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  const reverse = new Map(alphabet.split("").map((char, index) => [char, index]));
  let output = "";
  for (let i = 0; i < padded.length; i += 4) {
    const chars = padded.slice(i, i + 4).split("");
    const values = chars.map((char) => (char === "=" ? 0 : (reverse.get(char) ?? 0)));
    const triple =
      ((values[0] ?? 0) << 18) |
      ((values[1] ?? 0) << 12) |
      ((values[2] ?? 0) << 6) |
      (values[3] ?? 0);
    output += String.fromCharCode((triple >> 16) & 0xff);
    if (chars[2] !== "=") output += String.fromCharCode((triple >> 8) & 0xff);
    if (chars[3] !== "=") output += String.fromCharCode(triple & 0xff);
  }
  return output;
}

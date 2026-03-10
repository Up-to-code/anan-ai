const encoder = new TextEncoder();
const decoder = new TextDecoder();
const BASE64_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function bytesToBase64(bytes: Uint8Array, alphabet: string): string {
  let output = "";
  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i]!;
    const b = bytes[i + 1] ?? 0;
    const c = bytes[i + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    output += alphabet[(triple >> 18) & 0x3f];
    output += alphabet[(triple >> 12) & 0x3f];
    output += i + 1 < bytes.length ? alphabet[(triple >> 6) & 0x3f] : "=";
    output += i + 2 < bytes.length ? alphabet[triple & 0x3f] : "=";
  }
  return output;
}

function base64ToBytes(input: string, alphabet: string): Uint8Array {
  const clean = input.replace(/\s+/g, "");
  const normalized = clean.length % 4 === 0 ? clean : clean + "=".repeat(4 - (clean.length % 4));
  const reverse = new Map(alphabet.split("").map((char, index) => [char, index]));
  const bytes: number[] = [];

  for (let i = 0; i < normalized.length; i += 4) {
    const chars = normalized.slice(i, i + 4).split("");
    const values = chars.map((char) => (char === "=" ? 0 : (reverse.get(char) ?? 0)));
    const triple =
      ((values[0] ?? 0) << 18) |
      ((values[1] ?? 0) << 12) |
      ((values[2] ?? 0) << 6) |
      (values[3] ?? 0);
    bytes.push((triple >> 16) & 0xff);
    if (chars[2] !== "=") bytes.push((triple >> 8) & 0xff);
    if (chars[3] !== "=") bytes.push(triple & 0xff);
  }

  return new Uint8Array(bytes);
}

/**
 * WHY:   OAuth tokens, codes, and PKCE values must use URL-safe encoding.
 * WHAT:  Encodes bytes with the RFC 4648 base64url alphabet and no padding.
 * HOW:   Reuses a small internal base64 encoder then strips trailing `=`.
 */
export function base64UrlEncode(bytes: Uint8Array): string {
  return bytesToBase64(bytes, BASE64URL_ALPHABET).replace(/=/g, "");
}

/**
 * WHY:   Basic auth and PEM parsing still rely on standard base64.
 * WHAT:  Decodes a standard base64 string into bytes.
 * HOW:   Accepts padded or unpadded input and maps characters through the base64 alphabet.
 */
export function base64Decode(input: string): Uint8Array {
  return base64ToBytes(input, BASE64_ALPHABET);
}

/**
 * WHY:   JWT verification and PKCS key import need binary PEM payloads.
 * WHAT:  Converts a PEM block to an ArrayBuffer.
 * HOW:   Removes header/footer lines and decodes the remaining base64 body.
 */
export function pemToArrayBuffer(pem: string): ArrayBuffer {
  const body = pem.replace(/-----(BEGIN|END) [^-]+-----/g, "").replace(/\s+/g, "");
  const bytes = base64Decode(body);
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

/**
 * WHY:   Opaque auth codes and refresh tokens must be unpredictable.
 * WHAT:  Generates a random URL-safe token string.
 * HOW:   Uses `crypto.getRandomValues` and base64url encoding.
 */
export function randomToken(byteLength = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(byteLength));
  return base64UrlEncode(bytes);
}

/**
 * WHY:   Secrets and one-time codes must never be stored in plaintext.
 * WHAT:  Hashes a value with SHA-256 and an application pepper.
 * HOW:   Prefixes the raw value with a secret pepper and returns a hex digest.
 */
export async function sha256Hex(value: string, pepper = getPepper()): Promise<string> {
  const payload = encoder.encode(`${pepper}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", payload);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/**
 * WHY:   PKCE validation must compare against the S256 code challenge.
 * WHAT:  Returns the base64url-encoded SHA-256 digest of the verifier.
 * HOW:   Uses Web Crypto digest and URL-safe encoding.
 */
export async function sha256Base64Url(value: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(value));
  return base64UrlEncode(new Uint8Array(digest));
}

/**
 * WHY:   Pairwise subjects must stay stable per app while hiding internal IDs.
 * WHAT:  Derives a deterministic subject identifier from user and client identifiers.
 * HOW:   Uses an HMAC keyed by the configured OAuth subject secret and encodes the result.
 */
export async function createPairwiseSubject(userId: string, clientId: string): Promise<string> {
  const secret = getRequiredEnv("ANAN_OAUTH_SUBJECT_SECRET");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign("HMAC", key, encoder.encode(`${userId}:${clientId}`));
  return `sub_${base64UrlEncode(new Uint8Array(digest)).slice(0, 40)}`;
}

/**
 * WHY:   Constant-time comparison reduces timing leakage for secret-derived values.
 * WHAT:  Compares two same-length strings without early return on mismatch.
 * HOW:   XORs character codes across the whole string and checks the final accumulator.
 */
export function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

/**
 * WHY:   HTTP basic auth uses regular base64 credentials.
 * WHAT:  Parses a `Basic ...` header into client id and secret.
 * HOW:   Decodes the payload and splits on the first colon.
 */
export function parseBasicAuth(header: string | null): { clientId: string; clientSecret: string } | null {
  if (!header?.startsWith("Basic ")) return null;
  const decoded = decoder.decode(base64Decode(header.slice("Basic ".length)));
  const separator = decoded.indexOf(":");
  if (separator < 0) return null;
  return {
    clientId: decoded.slice(0, separator),
    clientSecret: decoded.slice(separator + 1),
  };
}

/**
 * WHY:   OAuth runtime configuration needs one shared, strongly-worded failure mode.
 * WHAT:  Reads a required environment variable or throws immediately.
 * HOW:   Centralizes the missing-env check for key and issuer configuration.
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing environment variable \`${name}\``);
  }
  return value;
}

function getPepper(): string {
  return getRequiredEnv("ANAN_OAUTH_SECRET_PEPPER");
}

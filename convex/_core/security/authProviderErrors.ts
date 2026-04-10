const NO_AUTH_PROVIDER_ERROR_CODE = "NoAuthProvider";
const NO_AUTH_PROVIDER_ERROR_MESSAGE =
  "No auth provider found matching the given token";
const TOKEN_EXPIRY_SKEW_MS = 30_000;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const [, payloadPart] = token.split(".");
  if (!payloadPart) {
    return null;
  }

  try {
    const json = Buffer.from(payloadPart, "base64url").toString("utf8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    return payload;
  } catch {
    return null;
  }
}

/**
 * WHY:   Session handlers need to identify provider-mismatch failures from Convex auth consistently.
 * WHAT:  Returns true when the error shape indicates Convex could not match a token issuer/provider.
 * HOW:   Checks direct error code fields and JSON-encoded message payloads used by Convex error serialization.
 */
export function isNoAuthProviderError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && error.code === NO_AUTH_PROVIDER_ERROR_CODE) {
    return true;
  }

  if (!("message" in error) || typeof error.message !== "string") {
    return false;
  }

  if (error.message.includes(NO_AUTH_PROVIDER_ERROR_MESSAGE)) {
    return true;
  }

  try {
    const payload = JSON.parse(error.message) as { code?: unknown; message?: unknown };
    return payload.code === NO_AUTH_PROVIDER_ERROR_CODE
      || (typeof payload.message === "string"
        && payload.message.includes(NO_AUTH_PROVIDER_ERROR_MESSAGE));
  } catch {
    return false;
  }
}

/**
 * WHY:   Stale/legacy tokens should be treated as signed-out while active token/provider mismatches must surface.
 * WHAT:  Returns true only when a JWT token can be proven expired from its `exp` claim.
 * HOW:   Decodes the JWT payload and compares `exp` against current time with a small clock-skew window.
 */
export function isClearlyExpiredJwtToken(
  token: string,
  nowMs: number = Date.now(),
): boolean {
  const payload = decodeJwtPayload(token);
  const expiresAtSeconds = payload?.exp;

  if (typeof expiresAtSeconds !== "number" || !Number.isFinite(expiresAtSeconds)) {
    return false;
  }

  return (expiresAtSeconds * 1000) <= (nowMs - TOKEN_EXPIRY_SKEW_MS);
}

/**
 * WHY:   Clerk-backed session resolution should distinguish a missing JWT template from ordinary signed-out state.
 * WHAT:  Returns true when the error shape matches Clerk's 404 response for an unknown JWT template.
 * HOW:   Checks the HTTP status plus common Clerk error message payload fields without depending on Clerk classes directly.
 */
export function isMissingClerkJwtTemplateError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if (!("status" in error) || error.status !== 404) {
    return false;
  }

  const message = "message" in error && typeof error.message === "string" ? error.message : "";
  const longMessage =
    "longMessage" in error && typeof error.longMessage === "string" ? error.longMessage : "";
  const combinedMessage = `${message} ${longMessage}`.toLowerCase();

  if (combinedMessage.includes("not found")) {
    return true;
  }

  if (!("errors" in error) || !Array.isArray(error.errors)) {
    return false;
  }

  return error.errors.some((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const entryCode = "code" in entry && typeof entry.code === "string" ? entry.code.toLowerCase() : "";
    const entryMessage =
      "message" in entry && typeof entry.message === "string" ? entry.message.toLowerCase() : "";

    return entryCode.includes("not_found") || entryMessage.includes("not found");
  });
}

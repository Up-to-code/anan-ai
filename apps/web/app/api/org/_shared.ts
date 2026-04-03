/**
 * WHY:   Machine API handlers all authenticate through the same custom header.
 * WHAT:  Returns the raw organization API key header value when present.
 * HOW:   Reads `X-Anan-Api-Key` directly from the request headers and leaves validation to the domain layer.
 */
export function getOrganizationApiKeyHeader(request: Request) {
  return request.headers.get("X-Anan-Api-Key");
}

/**
 * WHY:   API key governance should validate trusted caller origins when the client sends them.
 * WHAT:  Returns the normalized machine-caller origin hint from `Origin` or `Referer`.
 * HOW:   Prefers the explicit `Origin` header and falls back to the `Referer` origin when present.
 */
export function getOrganizationApiKeyOrigin(request: Request) {
  const origin = request.headers.get("Origin")?.trim();
  if (origin) return origin;
  const referer = request.headers.get("Referer")?.trim();
  if (!referer) return null;
  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

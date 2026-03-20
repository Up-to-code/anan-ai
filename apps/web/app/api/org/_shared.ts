/**
 * WHY:   Machine API handlers all authenticate through the same custom header.
 * WHAT:  Returns the raw organization API key header value when present.
 * HOW:   Reads `X-Anan-Api-Key` directly from the request headers and leaves validation to the domain layer.
 */
export function getOrganizationApiKeyHeader(request: Request) {
  return request.headers.get("X-Anan-Api-Key");
}

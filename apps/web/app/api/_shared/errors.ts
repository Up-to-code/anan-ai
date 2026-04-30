import { invalidJsonResponse } from "@anan/web-foundation/api";

/**
 * WHY:   Route handlers repeatedly need the same invalid-JSON failure without duplicating the payload.
 * WHAT:  Returns the normalized HTTP response for malformed JSON request bodies.
 * HOW:   Reuses the shared domain error serializer with the stable `INVALID_REQUEST` contract.
 */
export function toInvalidJsonResponse() {
  return invalidJsonResponse();
}

import { DomainError, toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   Route handlers repeatedly need the same invalid-JSON failure without duplicating the payload.
 * WHAT:  Returns the normalized HTTP response for malformed JSON request bodies.
 * HOW:   Reuses the shared domain error serializer with the stable `INVALID_REQUEST` contract.
 */
export function toInvalidJsonResponse() {
  return toErrorResponse(
    new DomainError({
      code: "INVALID_REQUEST",
      message: "Request body must be valid JSON",
      status: 400,
    }),
  );
}

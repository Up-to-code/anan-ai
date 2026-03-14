import { DomainError } from "@/server/contracts/errors";

/**
 * WHY:   Unsupported workspace audiences should fail with one shared domain error instead of repeating strings inline.
 * WHAT:  Returns a normalized `FORBIDDEN` error for an unavailable workspace capability.
 * HOW:   Formats the feature label into a stable user-facing message used by the zone orchestrators.
 */
export function createUnavailableZoneError(feature: string) {
  return new DomainError({
    code: "FORBIDDEN",
    message: `${feature} are unavailable for this workspace`,
    status: 403,
  });
}

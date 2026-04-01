import { ConvexError } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import type { OwnerContext } from "../agencies/repositories/core";
import type {
  OrganizationVerificationSubmittedData,
  PropertyVerificationSubmittedData,
  VerificationOrganizationType,
} from "./types";

/**
 * WHY:   Organization verification payloads should be normalized in one place before persistence.
 * WHAT:  Builds the submitted-data payload for broker and RED verification requests.
 * HOW:   Defaults empty arrays and derives `organizationType` from the normalized owner type.
 */
export function buildOrganizationVerificationSubmittedData(args: {
  requirements?: string[];
  sourceUrls?: string[];
  notes?: string;
  organizationType?: VerificationOrganizationType;
  ownerType: OwnerContext["ownerType"];
}): OrganizationVerificationSubmittedData {
  return {
    requirements: args.requirements ?? [],
    sourceUrls: args.sourceUrls ?? [],
    notes: args.notes ?? null,
    organizationType:
      args.organizationType ?? (args.ownerType === "broker" ? "broker" : "red"),
  };
}

/**
 * WHY:   Verification writes must fail fast when a request has no attached evidence.
 * WHAT:  Returns the merged verification documents array.
 * HOW:   Combines the required and optional arrays and throws when the merged result is empty.
 */
export function requireAttachedDocuments<T>(
  documents: ReadonlyArray<T>,
  proofDocuments: ReadonlyArray<T> | undefined,
) {
  const attachedDocuments = [...documents, ...(proofDocuments ?? [])];
  if (attachedDocuments.length === 0) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Verification documents are required",
    });
  }
  return attachedDocuments;
}

/**
 * WHY:   Property verification must be limited to the organization that owns the listing.
 * WHAT:  Verifies that the membership owner matches the property's owner linkage.
 * HOW:   Compares broker ownership via `brokerId` and developer ownership via `REDId`.
 */
export function ensurePropertyOwnerAccess(
  owner: OwnerContext,
  property: Doc<"properties">,
) {
  const ownerMatches =
    (owner.ownerType === "broker" && property.brokerId === owner.ownerBrokerId) ||
    (owner.ownerType === "RED" && property.REDId === owner.ownerREDId);
  if (!ownerMatches) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot verify this property" });
  }
}

/**
 * WHY:   Property verification submissions need a stable stored payload shape for admin review.
 * WHAT:  Builds the submitted-data payload for property verification requests.
 * HOW:   Normalizes optional notes to `null`.
 */
export function buildPropertyVerificationSubmittedData(args: {
  adLicenseNumber: string;
  notes?: string;
}): PropertyVerificationSubmittedData {
  return {
    adLicenseNumber: args.adLicenseNumber,
    notes: args.notes ?? null,
  };
}

import { v } from "convex/values";
import {
  gccPermitTypeValidator,
  gccPermitVerificationStatusValidator,
  gccSourceAuthorityValidator,
} from "../../_core/schema/gccCompliance";

/**
 * WHY:   GCC project publishing needs one jurisdiction-neutral permit shape.
 * WHAT:  Validates advertising, broker, and platform permit metadata across supported GCC markets.
 * HOW:   Keeps legacy license fields compatible while adding country, authority, QR/link, expiry, and channel scope.
 */
export const gccCompliancePermitInputValidator = v.object({
  countryCode: v.optional(v.string()),
  jurisdiction: v.optional(v.string()),
  permitType: v.optional(gccPermitTypeValidator),
  permitNumber: v.optional(v.string()),
  permitQrOrUrl: v.optional(v.string()),
  expiresAt: v.optional(v.number()),
  verificationStatus: v.optional(gccPermitVerificationStatusValidator),
  requiredForChannels: v.optional(v.array(v.string())),
  sourceAuthority: v.optional(gccSourceAuthorityValidator),
});

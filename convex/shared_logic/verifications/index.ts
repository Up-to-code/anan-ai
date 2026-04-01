import { mutation } from "../../_generated/server";
import { ConvexError } from "convex/values";
import { requireManagerAccess, requireOrganizationMembership } from "../agencies/repositories/membership";
import { resolveComplianceRulesetForOwner } from "../compliance/utils";
import {
  buildOrganizationVerificationSubmittedData,
  buildPropertyVerificationSubmittedData,
  ensurePropertyOwnerAccess,
  requireAttachedDocuments,
} from "./submissions";
import {
  organizationVerificationRequestFields,
  propertyVerificationRequestFields,
} from "./types/validation";

export const createVerificationRequestForCurrentOrg = mutation({
  args: organizationVerificationRequestFields,
  handler: async (ctx, args) => {
    const { owner, profile } = await requireManagerAccess(ctx);
    const { ruleset } = await resolveComplianceRulesetForOwner(ctx, owner);
    const attachedDocuments = requireAttachedDocuments(args.documents, args.proofDocuments);

    const requestType = owner.ownerType === "broker" ? "broker" : "RED";
    const now = Date.now();
    const subjectBrokerId = owner.ownerType === "broker" ? owner.ownerBrokerId : undefined;
    const subjectREDId = owner.ownerType === "RED" ? owner.ownerREDId : undefined;

    const requestId = await ctx.db.insert("verificationRequests", {
      requestType,
      subjectProfileId: profile._id,
      subjectBrokerId,
      subjectREDId,
      authUserId: profile.authUserId,
      title: "طلب توثيق جهة",
      currentStatus: "new",
      rulesetId: ruleset?._id,
      rulesetVersion: ruleset?.version,
      submittedData: buildOrganizationVerificationSubmittedData({
        requirements: args.requirements,
        sourceUrls: args.sourceUrls,
        notes: args.notes,
        organizationType: args.organizationType,
        ownerType: owner.ownerType,
      }),
      attachedDocuments,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { requestId };
  },
});

/**
 * WHY:   Listings require an ad-license verification request before publish in regulated markets.
 * WHAT:  Creates a property verification request for the current organization.
 * HOW:   Validates ownership, stores the request, and marks the property as pending review.
 */
export const createPropertyVerificationRequestForCurrentOrg = mutation({
  args: propertyVerificationRequestFields,
  handler: async (ctx, args) => {
    const { owner, profile } = await requireOrganizationMembership(ctx);
    const { ruleset } = await resolveComplianceRulesetForOwner(ctx, owner);

    const property = await ctx.db.get(args.propertyId);
    if (!property) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
    }

    ensurePropertyOwnerAccess(owner, property);
    const attachedDocuments = requireAttachedDocuments(args.documents, args.proofDocuments);

    const now = Date.now();
    const requestId = await ctx.db.insert("verificationRequests", {
      requestType: "property",
      subjectProfileId: profile._id,
      subjectBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      subjectREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      subjectPropertyId: args.propertyId,
      authUserId: profile.authUserId,
      title: "طلب توثيق إعلان عقاري",
      currentStatus: "new",
      rulesetId: ruleset?._id,
      rulesetVersion: ruleset?.version,
      submittedData: buildPropertyVerificationSubmittedData(args),
      attachedDocuments,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.patch(args.propertyId, {
      adLicenseNumber: args.adLicenseNumber,
      adLicenseStatus: "pending",
      adLicenseVerificationRequestId: requestId,
    });

    return { requestId };
  },
});

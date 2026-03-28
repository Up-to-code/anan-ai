import { mutation } from "../../_generated/server";
import { ConvexError, v } from "convex/values";
import { uploadedFileReferenceListValidator } from "../files";
import { requireManagerAccess, requireOrganizationMembership } from "../agencies/repositories/membership";
import { resolveComplianceRulesetForOwner } from "../compliance/utils";

function buildVerificationSubmittedData(args: {
  requirements?: string[];
  sourceUrls?: string[];
  notes?: string;
  organizationType?: "broker" | "red";
  ownerType: "broker" | "RED";
}) {
  return {
    requirements: args.requirements ?? [],
    sourceUrls: args.sourceUrls ?? [],
    notes: args.notes ?? null,
    organizationType: args.organizationType ?? (args.ownerType === "broker" ? "broker" : "red"),
  };
}

function requireAttachedDocuments<T>(
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

function ensurePropertyOwnerAccess(owner: any, property: any) {
  const ownerMatches =
    (owner.ownerType === "broker" && property.brokerId === owner.ownerBrokerId) ||
    (owner.ownerType === "RED" && property.REDId === owner.ownerREDId);
  if (!ownerMatches) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot verify this property" });
  }
}

function buildPropertyVerificationSubmittedData(args: { adLicenseNumber: string; notes?: string }) {
  return {
    adLicenseNumber: args.adLicenseNumber,
    notes: args.notes ?? null,
  };
}

export const createVerificationRequestForCurrentOrg = mutation({
  args: {
    documents: uploadedFileReferenceListValidator,
    proofDocuments: v.optional(uploadedFileReferenceListValidator),
    requirements: v.optional(v.array(v.string())),
    sourceUrls: v.optional(v.array(v.string())),
    notes: v.optional(v.string()),
    organizationType: v.optional(v.union(v.literal("broker"), v.literal("red"))),
  },
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
      submittedData: buildVerificationSubmittedData({
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
  args: {
    propertyId: v.id("properties"),
    adLicenseNumber: v.string(),
    documents: uploadedFileReferenceListValidator,
    proofDocuments: v.optional(uploadedFileReferenceListValidator),
    notes: v.optional(v.string()),
  },
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

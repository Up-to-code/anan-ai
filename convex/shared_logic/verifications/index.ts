import { mutation } from "../../_generated/server";
import { ConvexError, v } from "convex/values";
import { uploadedFileReferenceListValidator } from "../files";
import { requireOrganizationMembership } from "../agencies/repositories/membership";
import { getOwnerId } from "../agencies/repositories/core";

/**
 * WHY:   Broker/developer onboarding needs a first-party verification request entrypoint.
 * WHAT:  Creates a verification request for the current organization with attached documents.
 * HOW:   Enforces membership, derives owner ids, and inserts a `verificationRequests` row.
 */
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
    const { owner, profile } = await requireOrganizationMembership(ctx);

    const attachedDocuments = [
      ...args.documents,
      ...(args.proofDocuments ?? []),
    ];

    if (attachedDocuments.length === 0) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: "Verification documents are required",
      });
    }

    const requestType = owner.ownerType === "broker" ? "broker" : "RED";
    const now = Date.now();
    const ownerId = getOwnerId(owner);
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
      submittedData: {
        requirements: args.requirements ?? [],
        sourceUrls: args.sourceUrls ?? [],
        notes: args.notes ?? null,
        organizationType: args.organizationType ?? (owner.ownerType === "broker" ? "broker" : "red"),
      },
      attachedDocuments,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    return { requestId };
  },
});

import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import {
  buildVerificationDecisionHistory,
  buildVerificationListItem,
  buildVerificationSubjectDetail,
  countStatus,
} from "./services/verifications/mappers";
import {
  listVerificationRequestsByStatus,
  loadVerificationLookups,
} from "./services/verifications/lookups";
import { syncVerificationReviewSideEffects } from "./services/verifications/sideEffects";
import {
  optionalVerificationStatusValidator,
  reviewStatusValidator,
} from "../shared_logic/verifications/types/validation";

export const listVerificationRequests = query({
  args: {
    status: optionalVerificationStatusValidator,
  },
  handler: async (ctx, { status }) => {
    await requireRole(ctx, ["admin"]);
    const [requests, lookups] = await Promise.all([
      listVerificationRequestsByStatus(ctx, status),
      loadVerificationLookups(ctx),
    ]);
    return requests
      .map((request) => buildVerificationListItem(request, lookups))
      .sort((left, right) => right.submittedAt - left.submittedAt);
  },
});

/**
 * WHY:   Verification detail tabs need one request record with all submitted metadata and attached documents.
 * WHAT:  Returns a single verification request by id.
 * HOW:   Loads the request document directly from the new verification table.
 */
export const getVerificationRequest = query({
  args: { id: v.id("verificationRequests") },
  handler: async (ctx, { id }) => {
    await requireRole(ctx, ["admin"]);
    const [request, lookups] = await Promise.all([ctx.db.get(id), loadVerificationLookups(ctx)]);
    if (!request) return null;
    const dossier =
      request.subjectPropertyId
        ? await ctx.db
            .query("projectDossiers")
            .withIndex("propertyId", (q: any) => q.eq("propertyId", request.subjectPropertyId))
            .first()
        : null;
    const projectContext = dossier
      ? {
          dossier,
          documents: await ctx.db.query("projectComplianceDocuments").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
          adLicenses: await ctx.db.query("projectAdLicenses").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
          brokerAuthorizations: await ctx.db.query("projectBrokerAuthorizations").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
          blockers: dossier.readinessBlockers ?? [],
          warnings: dossier.readinessWarnings ?? [],
        }
      : null;
    return {
      ...request,
      subject: buildVerificationSubjectDetail(request, lookups),
      projectContext,
      documentsCount: request.attachedDocuments.length,
      decisionHistory: buildVerificationDecisionHistory(request),
    };
  },
});

/**
 * WHY:   The verification workspace also needs lightweight status counters for summary cards and top-level tabs.
 * WHAT:  Returns counts for each verification status bucket.
 * HOW:   Reads all requests once and groups them by `currentStatus`.
 */
export const verificationStatusSummary = query({
  args: {},
  handler: async (ctx) => {
    await requireRole(ctx, ["admin"]);
    const requests = await ctx.db.query("verificationRequests").order("desc").take(500);

    return {
      new: countStatus(requests, "new"),
      inReview: countStatus(requests, "in_review"),
      approved: countStatus(requests, "approved"),
      rejected: countStatus(requests, "rejected"),
      closed: countStatus(requests, "closed"),
    };
  },
});

/**
 * WHY:   Admin reviewers need a single mutation to move verification requests through review and sync approval state.
 * WHAT:  Updates a verification request status and reviewer notes, then mirrors approval into the linked profile or organization.
 * HOW:   Patches the request document and applies approval/rejection effects to `userProfiles`, `brokers`, or `RED` when linked.
 */
export const reviewVerificationRequest = mutation({
  args: {
    id: v.id("verificationRequests"),
    status: reviewStatusValidator,
    reviewerId: v.string(),
    reviewerNotes: v.optional(v.string()),
  },
  handler: async (ctx, { id, status, reviewerId, reviewerNotes }) => {
    await requireRole(ctx, ["admin"]);
    const request = await ctx.db.get(id);
    if (!request) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Verification request not found" });
    }
    const now = Date.now();
    await ctx.db.patch(id, {
      currentStatus: status,
      reviewerId,
      reviewerNotes,
      reviewedAt: status === "in_review" ? undefined : now,
      updatedAt: now,
    });
    await syncVerificationReviewSideEffects(ctx, request, status, now);
  },
});

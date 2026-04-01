import type { MutationCtx } from "../../../_generated/server";
import type {
  ReviewStatus,
  VerificationRequestRecord,
} from "../../../shared_logic/verifications/types";

async function syncUserVerification(
  ctx: MutationCtx,
  request: VerificationRequestRecord,
  status: ReviewStatus,
  now: number,
) {
  if (request.requestType !== "user" || !request.subjectProfileId) return;
  const profile = await ctx.db.get(request.subjectProfileId);
  if (!profile) return;

  const patch: Record<string, unknown> = {
    roleStatus:
      status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending",
    updatedAt: now,
  };

  if (status === "approved" && profile.requestedRole) {
    patch.role = profile.requestedRole;
  }

  await ctx.db.patch(profile._id, patch);
}

async function syncBrokerVerification(
  ctx: MutationCtx,
  request: VerificationRequestRecord,
  status: ReviewStatus,
) {
  if (request.requestType !== "broker" || !request.subjectBrokerId) return;
  const broker = await ctx.db.get(request.subjectBrokerId);
  if (!broker) return;

  await ctx.db.patch(broker._id, {
    isVerified: status === "approved",
    status: status === "approved" ? "active" : broker.status,
  });
}

async function syncDeveloperVerification(
  ctx: MutationCtx,
  request: VerificationRequestRecord,
  status: ReviewStatus,
) {
  if (request.requestType !== "RED" || !request.subjectREDId) return;
  const developer = await ctx.db.get(request.subjectREDId);
  if (!developer) return;

  await ctx.db.patch(developer._id, {
    isVerified: status === "approved",
    status: status === "approved" ? "active" : developer.status,
  });
}

async function syncPropertyVerification(
  ctx: MutationCtx,
  request: VerificationRequestRecord,
  status: ReviewStatus,
) {
  if (request.requestType !== "property" || !request.subjectPropertyId) return;
  const property = await ctx.db.get(request.subjectPropertyId);
  if (!property) return;

  const nextStatus =
    status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending";
  const submittedLicense = (request.submittedData as { adLicenseNumber?: string } | null)
    ?.adLicenseNumber;

  await ctx.db.patch(property._id, {
    adLicenseStatus: nextStatus,
    adLicenseNumber: submittedLicense ?? property.adLicenseNumber,
    adLicenseVerificationRequestId: request._id,
  });
}

/**
 * WHY:   Admin review mutations must mirror status changes into the linked profile, org, or property.
 * WHAT:  Applies all review side effects for a verification request.
 * HOW:   Dispatches to user, broker, developer, and property sync helpers based on `requestType`.
 */
export async function syncVerificationReviewSideEffects(
  ctx: MutationCtx,
  request: VerificationRequestRecord,
  status: ReviewStatus,
  now: number,
) {
  await syncUserVerification(ctx, request, status, now);
  await syncBrokerVerification(ctx, request, status);
  await syncDeveloperVerification(ctx, request, status);
  await syncPropertyVerification(ctx, request, status);
}

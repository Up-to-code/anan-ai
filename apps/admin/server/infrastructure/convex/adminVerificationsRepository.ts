import { createRepositoryRefs, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

type VerificationsApiRefs = {
  listVerificationRequests: unknown;
  verificationStatusSummary: unknown;
  getVerificationRequest: unknown;
  reviewVerificationRequest: unknown;
};

const verificationsApi = createRepositoryRefs<VerificationsApiRefs>(apiUnsafe, "admin_zone/verifications");

/**
 * WHY:   Verification review is now a first-class admin workflow and needs its own repository surface.
 * WHAT:  Exposes status-tab list reads, summary counts, detail reads, and review mutations.
 * HOW:   Delegates to `convex/admin_zone/verifications` with the current admin token.
 */
export const convexAdminVerificationsRepository = {
  async list(token: string, status?: "new" | "in_review" | "approved" | "rejected" | "closed") {
    return queryRef<Array<Record<string, unknown>>>(token, verificationsApi.listVerificationRequests, { status });
  },
  async getSummary(token: string) {
    return queryRef<{
      new: number;
      inReview: number;
      approved: number;
      rejected: number;
      closed: number;
    }>(token, verificationsApi.verificationStatusSummary);
  },
  async getDetail(token: string, id: string) {
    return queryRef<Record<string, unknown> | null>(token, verificationsApi.getVerificationRequest, { id });
  },
  async review(token: string, input: { id: string; status: "in_review" | "approved" | "rejected" | "closed"; reviewerId: string; reviewerNotes?: string }) {
    await voidMutationRef(token, verificationsApi.reviewVerificationRequest, input);
  },
};

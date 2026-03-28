import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type VerificationsApiRefs = {
  listVerificationRequests: unknown;
  verificationStatusSummary: unknown;
  getVerificationRequest: unknown;
  reviewVerificationRequest: unknown;
};

const verificationsApi = apiUnsafe["admin_zone/verifications"] as VerificationsApiRefs;

/**
 * WHY:   Verification review is now a first-class admin workflow and needs its own repository surface.
 * WHAT:  Exposes status-tab list reads, summary counts, detail reads, and review mutations.
 * HOW:   Delegates to `convex/admin_zone/verifications` with the current admin token.
 */
export const convexAdminVerificationsRepository = {
  async list(token: string, status?: "new" | "in_review" | "approved" | "rejected" | "closed") {
    return fetchQuery(verificationsApi.listVerificationRequests as never, { status } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async getSummary(token: string) {
    return fetchQuery(verificationsApi.verificationStatusSummary as never, {} as never, { token }) as Promise<{
      new: number;
      inReview: number;
      approved: number;
      rejected: number;
      closed: number;
    }>;
  },
  async getDetail(token: string, id: string) {
    return fetchQuery(verificationsApi.getVerificationRequest as never, { id } as never, { token }) as Promise<Record<string, unknown> | null>;
  },
  async review(token: string, input: { id: string; status: "in_review" | "approved" | "rejected" | "closed"; reviewerId: string; reviewerNotes?: string }) {
    await fetchMutation(verificationsApi.reviewVerificationRequest as never, input as never, { token });
  },
};

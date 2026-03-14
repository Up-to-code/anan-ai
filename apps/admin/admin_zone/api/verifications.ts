import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import { convexAdminVerificationsRepository } from "@/server/infrastructure/convex/adminVerificationsRepository";

/**
 * WHY:   The verification workspace combines read-only queue tabs with review actions.
 * WHAT:  Exposes tab loaders, detail loaders, and review mutations for admin verification requests.
 * HOW:   Resolves the current admin session once and delegates to the verifications repository.
 */
export async function getVerificationsPageData(tab: "new" | "in_review" | "approved" | "rejected") {
  const session = await requireAdminPageSession("/verifications");
  const token = session.token;

  const [summary, rows] = await Promise.all([
    convexAdminVerificationsRepository.getSummary(token),
    convexAdminVerificationsRepository.list(token, tab),
  ]);

  return { session, tab, summary, rows };
}

/**
 * WHY:   Verification detail screens need one server-owned loader for the selected request record.
 * WHAT:  Returns the admin session plus the verification detail payload for the requested verification id.
 * HOW:   Resolves the page session path from the route id, then delegates the detail lookup to the repository.
 */
export async function getVerificationDetailPageData(requestId: string) {
  const session = await requireAdminPageSession(`/verifications/${encodeURIComponent(requestId)}`);
  const detail = await convexAdminVerificationsRepository.getDetail(session.token, requestId);

  return {
    session,
    detail,
  };
}

/**
 * WHY:   Verification review actions should stay behind a single admin-only server mutation boundary.
 * WHAT:  Reviews one verification request and records the current admin as the reviewer.
 * HOW:   Resolves the admin session and forwards the payload to the repository with `reviewerId` injected from session context.
 */
export async function reviewVerificationRequest(input: {
  id: string;
  status: "in_review" | "approved" | "rejected";
  reviewerNotes?: string;
}) {
  "use server";

  const session = await requireAdminSession();
  await convexAdminVerificationsRepository.review(session.token, {
    ...input,
    reviewerId: session.context.userId,
  });
}

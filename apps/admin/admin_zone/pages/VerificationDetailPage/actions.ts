"use server";

import { revalidatePath } from "next/cache";
import { reviewVerificationRequest } from "@/admin_zone/api/verifications";

const allowedStatuses = new Set(["in_review", "approved", "rejected", "closed"]);

/**
 * WHY:   Verification detail pages need one reusable server action for admin review state changes.
 * WHAT:  Validates the form payload, forwards the review decision, and revalidates the affected admin routes.
 * HOW:   Accepts a FormData submission from the detail page and delegates the mutation to the admin API layer.
 */
export async function submitVerificationReviewAction(formData: FormData) {
  const id = formData.get("id");
  const status = formData.get("status");
  const reviewerNotes = formData.get("reviewerNotes");

  if (typeof id !== "string" || typeof status !== "string" || !allowedStatuses.has(status)) {
    throw new Error("Invalid verification review payload");
  }

  await reviewVerificationRequest({
    id,
    status: status as "in_review" | "approved" | "rejected" | "closed",
    reviewerNotes: typeof reviewerNotes === "string" && reviewerNotes.trim().length > 0 ? reviewerNotes : undefined,
  });

  revalidatePath("/verifications");
  revalidatePath(`/verifications/${id}`);
}


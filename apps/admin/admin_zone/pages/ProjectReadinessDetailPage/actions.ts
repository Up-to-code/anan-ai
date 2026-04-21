"use server";

import { redirect } from "next/navigation";
import {
  forceProjectReadinessRecomputeAction,
  markProjectWafiReviewedAction,
  reviewProjectAdLicenseAction,
  reviewProjectDocumentAction,
  setProjectAdminBlockAction,
} from "@/admin_zone/api/projects";

export async function submitProjectDocumentReviewAction(formData: FormData) {
  await reviewProjectDocumentAction({
    documentId: String(formData.get("documentId")),
    status: String(formData.get("status")) as "approved" | "rejected" | "in_review" | "expired",
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  redirect(`/projects/${String(formData.get("dossierId"))}`);
}

export async function submitProjectAdLicenseReviewAction(formData: FormData) {
  await reviewProjectAdLicenseAction({
    adLicenseId: String(formData.get("adLicenseId")),
    status: String(formData.get("status")) as "approved" | "rejected" | "pending" | "expired",
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  redirect(`/projects/${String(formData.get("dossierId"))}`);
}

export async function submitProjectAdminBlockAction(formData: FormData) {
  await setProjectAdminBlockAction({
    dossierId: String(formData.get("dossierId")),
    blocked: String(formData.get("blocked")) === "true",
    reason: String(formData.get("reason") ?? "") || undefined,
  });
  redirect(`/projects/${String(formData.get("dossierId"))}`);
}

export async function submitProjectWafiReviewedAction(formData: FormData) {
  await markProjectWafiReviewedAction({
    dossierId: String(formData.get("dossierId")),
    notes: String(formData.get("notes") ?? "") || undefined,
  });
  redirect(`/projects/${String(formData.get("dossierId"))}`);
}

export async function submitProjectRecomputeAction(formData: FormData) {
  await forceProjectReadinessRecomputeAction({ propertyId: String(formData.get("propertyId")) });
  redirect(`/projects/${String(formData.get("dossierId"))}`);
}

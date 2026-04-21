import { requireAdminSession } from "@/server/auth/guards";
import { requireAdminPageSession } from "@/lib/serverSession";
import {
  convexAdminProjectsRepository,
  type ProjectReadinessQueueFilter,
} from "@/server/infrastructure/convex/adminProjectsRepository";

export async function getProjectReadinessQueuePageData(filter: ProjectReadinessQueueFilter = "incomplete") {
  const session = await requireAdminPageSession("/projects");
  const rows = await convexAdminProjectsRepository.listQueue(session.token, filter);
  return { session, filter, rows };
}

export async function getProjectReadinessDetailPageData(dossierId: string) {
  const session = await requireAdminPageSession(`/projects/${encodeURIComponent(dossierId)}`);
  const detail = await convexAdminProjectsRepository.getDetail(session.token, dossierId);
  return { session, detail };
}

export async function reviewProjectDocumentAction(input: {
  documentId: string;
  status: "approved" | "rejected" | "in_review" | "expired";
  notes?: string;
}) {
  "use server";
  const session = await requireAdminSession();
  return convexAdminProjectsRepository.reviewDocument(session.token, input);
}

export async function reviewProjectAdLicenseAction(input: {
  adLicenseId: string;
  status: "approved" | "rejected" | "pending" | "expired";
  notes?: string;
}) {
  "use server";
  const session = await requireAdminSession();
  return convexAdminProjectsRepository.reviewAdLicense(session.token, input);
}

export async function markProjectWafiReviewedAction(input: { dossierId: string; notes?: string }) {
  "use server";
  const session = await requireAdminSession();
  return convexAdminProjectsRepository.markWafiLegalReviewed(session.token, input);
}

export async function setProjectAdminBlockAction(input: { dossierId: string; blocked: boolean; reason?: string }) {
  "use server";
  const session = await requireAdminSession();
  return convexAdminProjectsRepository.setAdminBlock(session.token, input);
}

export async function forceProjectReadinessRecomputeAction(input: { propertyId: string }) {
  "use server";
  const session = await requireAdminSession();
  return convexAdminProjectsRepository.forceRecompute(session.token, input);
}

export async function runProjectMigrationAction(action: "preflight" | "migrate" | "postflight", limit?: number) {
  "use server";
  const session = await requireAdminSession();
  if (action === "preflight") return convexAdminProjectsRepository.migrationPreflight(session.token);
  if (action === "postflight") return convexAdminProjectsRepository.migrationPostflight(session.token);
  return convexAdminProjectsRepository.runMigrationBatch(session.token, limit ?? 200);
}

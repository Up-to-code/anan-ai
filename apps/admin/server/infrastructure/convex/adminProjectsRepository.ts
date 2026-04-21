import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";

type AdminProjectsApiRefs = {
  listProjectReadinessQueue: unknown;
  getProjectReviewDetail: unknown;
  reviewProjectDocument: unknown;
  reviewProjectAdLicense: unknown;
  markWafiLegalReviewed: unknown;
  setProjectAdminBlock: unknown;
  forceRecomputeProjectReadiness: unknown;
};

type MigrationApiRefs = {
  projectDossierMigrationPreflight: unknown;
  hardMigratePropertiesToProjectDossiers: unknown;
  projectDossierMigrationPostflight: unknown;
};

const projectsApi = apiUnsafe["admin_zone/projects"] as AdminProjectsApiRefs;
const migrationsApi = apiUnsafe["shared_logic/projects/migrations"] as MigrationApiRefs;

export type ProjectReadinessQueueFilter = "incomplete" | "pending_review" | "approved" | "blocked" | "expired";

/**
 * WHY:   Saudi project readiness review is now an admin workflow separate from generic verification.
 * WHAT:  Exposes queue, detail, review actions, and migration checks for admin pages.
 * HOW:   Calls the Convex admin project and migration APIs with the current admin token.
 */
export const convexAdminProjectsRepository = {
  async listQueue(token: string, filter: ProjectReadinessQueueFilter, limit = 100) {
    return fetchQuery(projectsApi.listProjectReadinessQueue as never, { filter, limit } as never, { token }) as Promise<Array<Record<string, unknown>>>;
  },
  async getDetail(token: string, dossierId: string) {
    return fetchQuery(projectsApi.getProjectReviewDetail as never, { dossierId } as never, { token }) as Promise<Record<string, unknown> | null>;
  },
  async reviewDocument(token: string, input: { documentId: string; status: "approved" | "rejected" | "in_review" | "expired"; notes?: string }) {
    return fetchMutation(projectsApi.reviewProjectDocument as never, input as never, { token }) as Promise<Record<string, unknown>>;
  },
  async reviewAdLicense(token: string, input: { adLicenseId: string; status: "approved" | "rejected" | "pending" | "expired"; notes?: string }) {
    return fetchMutation(projectsApi.reviewProjectAdLicense as never, input as never, { token }) as Promise<Record<string, unknown>>;
  },
  async markWafiLegalReviewed(token: string, input: { dossierId: string; notes?: string }) {
    return fetchMutation(projectsApi.markWafiLegalReviewed as never, input as never, { token }) as Promise<Record<string, unknown>>;
  },
  async setAdminBlock(token: string, input: { dossierId: string; blocked: boolean; reason?: string }) {
    return fetchMutation(projectsApi.setProjectAdminBlock as never, input as never, { token }) as Promise<Record<string, unknown>>;
  },
  async forceRecompute(token: string, input: { propertyId: string }) {
    return fetchMutation(projectsApi.forceRecomputeProjectReadiness as never, input as never, { token }) as Promise<Record<string, unknown>>;
  },
  async migrationPreflight(token: string) {
    return fetchMutation(migrationsApi.projectDossierMigrationPreflight as never, {} as never, { token }) as Promise<Record<string, unknown>>;
  },
  async runMigrationBatch(token: string, limit = 200) {
    return fetchMutation(migrationsApi.hardMigratePropertiesToProjectDossiers as never, { limit } as never, { token }) as Promise<Record<string, unknown>>;
  },
  async migrationPostflight(token: string) {
    return fetchMutation(migrationsApi.projectDossierMigrationPostflight as never, {} as never, { token }) as Promise<Record<string, unknown>>;
  },
};

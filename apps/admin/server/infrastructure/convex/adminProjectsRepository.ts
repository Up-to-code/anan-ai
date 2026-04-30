import { createRepositoryRefs, mutationRef, queryRef } from "@anan/convex-adapters/repository";
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

const projectsApi = createRepositoryRefs<AdminProjectsApiRefs>(apiUnsafe, "admin_zone/projects");
const migrationsApi = createRepositoryRefs<MigrationApiRefs>(apiUnsafe, "shared_logic/projects/migrations");

export type ProjectReadinessQueueFilter = "incomplete" | "pending_review" | "approved" | "blocked" | "expired";

/**
 * WHY:   Saudi project readiness review is now an admin workflow separate from generic verification.
 * WHAT:  Exposes queue, detail, review actions, and migration checks for admin pages.
 * HOW:   Calls the Convex admin project and migration APIs with the current admin token.
 */
export const convexAdminProjectsRepository = {
  async listQueue(token: string, filter: ProjectReadinessQueueFilter, limit = 100) {
    return queryRef<Array<Record<string, unknown>>>(token, projectsApi.listProjectReadinessQueue, { filter, limit });
  },
  async getDetail(token: string, dossierId: string) {
    return queryRef<Record<string, unknown> | null>(token, projectsApi.getProjectReviewDetail, { dossierId });
  },
  async reviewDocument(token: string, input: { documentId: string; status: "approved" | "rejected" | "in_review" | "expired"; notes?: string }) {
    return mutationRef<Record<string, unknown>>(token, projectsApi.reviewProjectDocument, input);
  },
  async reviewAdLicense(token: string, input: { adLicenseId: string; status: "approved" | "rejected" | "pending" | "expired"; notes?: string }) {
    return mutationRef<Record<string, unknown>>(token, projectsApi.reviewProjectAdLicense, input);
  },
  async markWafiLegalReviewed(token: string, input: { dossierId: string; notes?: string }) {
    return mutationRef<Record<string, unknown>>(token, projectsApi.markWafiLegalReviewed, input);
  },
  async setAdminBlock(token: string, input: { dossierId: string; blocked: boolean; reason?: string }) {
    return mutationRef<Record<string, unknown>>(token, projectsApi.setProjectAdminBlock, input);
  },
  async forceRecompute(token: string, input: { propertyId: string }) {
    return mutationRef<Record<string, unknown>>(token, projectsApi.forceRecomputeProjectReadiness, input);
  },
  async migrationPreflight(token: string) {
    return mutationRef<Record<string, unknown>>(token, migrationsApi.projectDossierMigrationPreflight);
  },
  async runMigrationBatch(token: string, limit = 200) {
    return mutationRef<Record<string, unknown>>(token, migrationsApi.hardMigratePropertiesToProjectDossiers, { limit });
  },
  async migrationPostflight(token: string) {
    return mutationRef<Record<string, unknown>>(token, migrationsApi.projectDossierMigrationPostflight);
  },
};

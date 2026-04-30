import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type WorkspaceProjectInternalRefs = {
  getProjectDossier: unknown;
  getProjectDossierByProjectId: unknown;
  getProjectsWorkspace: unknown;
  getProjectWorkspaceDetail: unknown;
  getProjectReadiness: unknown;
  saveProjectDossierDraft: unknown;
  saveProjectUnits: unknown;
  applyProjectUnitBulkActions: unknown;
  archiveProject: unknown;
  saveProjectPaymentPlans: unknown;
  saveProjectComplianceDocuments: unknown;
  saveProjectAdLicense: unknown;
  saveProjectBrokerAuthorization: unknown;
  requestProjectPublication: unknown;
};

export const redProjectsApi = createRepositoryRefs<WorkspaceProjectInternalRefs>(apiUnsafe, "red_zone/projects");
export const brokerProjectsApi = createRepositoryRefs<WorkspaceProjectInternalRefs>(apiUnsafe, "broker_zone/projects");

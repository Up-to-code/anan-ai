import { apiUnsafe } from "@/lib/convexApi";

export type WorkspaceProjectInternalRefs = {
  getProjectDossier: unknown;
  getProjectDossierByProjectId: unknown;
  getProjectReadiness: unknown;
  saveProjectDossierDraft: unknown;
  saveProjectUnits: unknown;
  applyProjectUnitBulkActions: unknown;
  saveProjectPaymentPlans: unknown;
  saveProjectComplianceDocuments: unknown;
  saveProjectAdLicense: unknown;
  saveProjectBrokerAuthorization: unknown;
  requestProjectPublication: unknown;
};

export const redProjectsApi = apiUnsafe["red_zone/projects"] as WorkspaceProjectInternalRefs;
export const brokerProjectsApi = apiUnsafe["broker_zone/projects"] as WorkspaceProjectInternalRefs;

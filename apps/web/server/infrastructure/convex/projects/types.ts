import type {
  ProjectAdLicenseInput,
  ProjectBrokerAuthorizationInput,
  ProjectComplianceDocumentInput,
  ProjectDossierDetail,
  ProjectDossierInput,
  ProjectDraftSaveResult,
  ProjectPaymentPlanInput,
  ProjectPublishSuccessResult,
  ProjectReadinessResult,
  ProjectUnitInput,
} from "@/server/contracts/projects";

export type WorkspaceProjectRepository = {
  getProjectDossier(token: string, propertyId: string): Promise<ProjectDossierDetail | null>;
  getProjectReadiness(token: string, propertyId: string): Promise<ProjectReadinessResult | null>;
  saveProjectDossierDraft(token: string, input: ProjectDossierInput): Promise<ProjectDraftSaveResult>;
  saveProjectUnits(token: string, propertyId: string, units: ProjectUnitInput[]): Promise<ProjectDraftSaveResult>;
  saveProjectPaymentPlans(token: string, propertyId: string, paymentPlans: ProjectPaymentPlanInput[]): Promise<ProjectDraftSaveResult>;
  saveProjectComplianceDocuments(token: string, propertyId: string, documents: ProjectComplianceDocumentInput[]): Promise<ProjectDraftSaveResult>;
  saveProjectAdLicense(token: string, propertyId: string, adLicense?: ProjectAdLicenseInput): Promise<ProjectDraftSaveResult>;
  saveProjectBrokerAuthorization(token: string, propertyId: string, authorization?: ProjectBrokerAuthorizationInput): Promise<ProjectDraftSaveResult>;
  requestProjectPublication(token: string, propertyId: string): Promise<ProjectPublishSuccessResult>;
};

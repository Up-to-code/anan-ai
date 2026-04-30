import { mutationRef, queryRef } from "@anan/convex-adapters/repository";
import type { WorkspaceProjectRepository } from "./types";
import { brokerProjectsApi, redProjectsApi, type WorkspaceProjectInternalRefs } from "./api";

function buildRepository(api: WorkspaceProjectInternalRefs): WorkspaceProjectRepository {
  return {
    async getProjectDossier(token, propertyId) {
      return queryRef<Awaited<ReturnType<WorkspaceProjectRepository["getProjectDossier"]>>>(
        token,
        api.getProjectDossier,
        { propertyId },
      );
    },
    async getProjectDossierByProjectId(token, projectId) {
      return queryRef<Awaited<ReturnType<WorkspaceProjectRepository["getProjectDossierByProjectId"]>>>(
        token,
        api.getProjectDossierByProjectId,
        { projectId },
      );
    },
    async getProjectsWorkspace(token) {
      return queryRef<Awaited<ReturnType<WorkspaceProjectRepository["getProjectsWorkspace"]>>>(
        token,
        api.getProjectsWorkspace,
        {},
      );
    },
    async getProjectWorkspaceDetail(token, projectId) {
      return queryRef<Awaited<ReturnType<WorkspaceProjectRepository["getProjectWorkspaceDetail"]>>>(
        token,
        api.getProjectWorkspaceDetail,
        { projectId },
      );
    },
    async getProjectReadiness(token, propertyId) {
      return queryRef<Awaited<ReturnType<WorkspaceProjectRepository["getProjectReadiness"]>>>(
        token,
        api.getProjectReadiness,
        { propertyId },
      );
    },
    async saveProjectDossierDraft(token, input) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectDossierDraft"]>>>(
        token,
        api.saveProjectDossierDraft,
        input,
      );
    },
    async saveProjectUnits(token, propertyId, units) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectUnits"]>>>(
        token,
        api.saveProjectUnits,
        { propertyId, units },
      );
    },
    async applyProjectUnitBulkActions(token, propertyId, actions) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["applyProjectUnitBulkActions"]>>>(
        token,
        api.applyProjectUnitBulkActions,
        { propertyId, actions },
      );
    },
    async archiveProject(token, propertyId) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["archiveProject"]>>>(
        token,
        api.archiveProject,
        { propertyId },
      );
    },
    async saveProjectPaymentPlans(token, propertyId, paymentPlans) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectPaymentPlans"]>>>(
        token,
        api.saveProjectPaymentPlans,
        { propertyId, paymentPlans },
      );
    },
    async saveProjectComplianceDocuments(token, propertyId, documents) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectComplianceDocuments"]>>>(
        token,
        api.saveProjectComplianceDocuments,
        { propertyId, documents },
      );
    },
    async saveProjectAdLicense(token, propertyId, adLicense) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectAdLicense"]>>>(
        token,
        api.saveProjectAdLicense,
        { propertyId, adLicense },
      );
    },
    async saveProjectBrokerAuthorization(token, propertyId, authorization) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["saveProjectBrokerAuthorization"]>>>(
        token,
        api.saveProjectBrokerAuthorization,
        { propertyId, authorization },
      );
    },
    async requestProjectPublication(token, propertyId) {
      return mutationRef<Awaited<ReturnType<WorkspaceProjectRepository["requestProjectPublication"]>>>(
        token,
        api.requestProjectPublication,
        { propertyId },
      );
    },
  };
}

export type { WorkspaceProjectRepository } from "./types";
export const convexRedProjectRepository = buildRepository(redProjectsApi);
export const convexBrokerProjectRepository = buildRepository(brokerProjectsApi);

import { fetchMutation, fetchQuery } from "convex/nextjs";
import type { WorkspaceProjectRepository } from "./types";
import { brokerProjectsApi, redProjectsApi, type WorkspaceProjectInternalRefs } from "./api";

function buildRepository(api: WorkspaceProjectInternalRefs): WorkspaceProjectRepository {
  return {
    async getProjectDossier(token, propertyId) {
      return fetchQuery(api.getProjectDossier as never, { propertyId: propertyId as never } as never, { token }) as ReturnType<WorkspaceProjectRepository["getProjectDossier"]>;
    },
    async getProjectReadiness(token, propertyId) {
      return fetchQuery(api.getProjectReadiness as never, { propertyId: propertyId as never } as never, { token }) as ReturnType<WorkspaceProjectRepository["getProjectReadiness"]>;
    },
    async saveProjectDossierDraft(token, input) {
      return fetchMutation(api.saveProjectDossierDraft as never, input as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectDossierDraft"]>;
    },
    async saveProjectUnits(token, propertyId, units) {
      return fetchMutation(api.saveProjectUnits as never, { propertyId, units } as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectUnits"]>;
    },
    async saveProjectPaymentPlans(token, propertyId, paymentPlans) {
      return fetchMutation(api.saveProjectPaymentPlans as never, { propertyId, paymentPlans } as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectPaymentPlans"]>;
    },
    async saveProjectComplianceDocuments(token, propertyId, documents) {
      return fetchMutation(api.saveProjectComplianceDocuments as never, { propertyId, documents } as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectComplianceDocuments"]>;
    },
    async saveProjectAdLicense(token, propertyId, adLicense) {
      return fetchMutation(api.saveProjectAdLicense as never, { propertyId, adLicense } as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectAdLicense"]>;
    },
    async saveProjectBrokerAuthorization(token, propertyId, authorization) {
      return fetchMutation(api.saveProjectBrokerAuthorization as never, { propertyId, authorization } as never, { token }) as ReturnType<WorkspaceProjectRepository["saveProjectBrokerAuthorization"]>;
    },
    async requestProjectPublication(token, propertyId) {
      return fetchMutation(api.requestProjectPublication as never, { propertyId } as never, { token }) as ReturnType<WorkspaceProjectRepository["requestProjectPublication"]>;
    },
  };
}

export type { WorkspaceProjectRepository } from "./types";
export const convexRedProjectRepository = buildRepository(redProjectsApi);
export const convexBrokerProjectRepository = buildRepository(brokerProjectsApi);

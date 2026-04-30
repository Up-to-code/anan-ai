import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireEntitlements } from "../_core/security/accessPolicy";
import {
  applyOwnedProjectUnitBulkActions,
  archiveOwnedProject,
  getOwnedProjectDossierDetail,
  getOwnedProjectDossierDetailByProjectId,
  getOwnedProjectWorkspaceDetail,
  getOwnedProjectsWorkspace,
  requestOwnedProjectPublication,
  saveOwnedProjectAdLicense,
  saveOwnedProjectBrokerAuthorization,
  saveOwnedProjectComplianceDocuments,
  saveOwnedProjectDossierDraft,
  saveOwnedProjectPaymentPlans,
  saveOwnedProjectUnits,
} from "../shared_logic/projects/operations";
import {
  projectAdLicenseInputValidator,
  projectBrokerAuthorizationInputValidator,
  projectComplianceDocumentInputValidator,
  projectDossierDraftInputValidator,
  projectPaymentPlanInputValidator,
  projectUnitBulkActionValidator,
  projectUnitInputValidator,
} from "../shared_logic/projects/validation";

async function requireDeveloperAccess(ctx: any) {
  const access = await requireEntitlements(ctx, ["workspace:developer"]);
  return { authUserId: access.authUserId, role: access.role, REDId: access.REDId };
}

/**
 * WHY:   Developer workspace needs the complete Saudi dossier, not only the legacy property projection.
 * WHAT:  Returns one owner-scoped project dossier detail by property id.
 * HOW:   Delegates owner enforcement and table joins to shared project operations.
 */
export const getProjectDossier = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => getOwnedProjectDossierDetail(ctx, propertyId, await requireDeveloperAccess(ctx)),
});

export const getProjectDossierByProjectId = query({
  args: { projectId: v.id("projectDossiers") },
  handler: async (ctx, { projectId }) => getOwnedProjectDossierDetailByProjectId(ctx, projectId, await requireDeveloperAccess(ctx)),
});

export const getProjectReadiness = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const detail = await getOwnedProjectDossierDetail(ctx, propertyId, await requireDeveloperAccess(ctx));
    return detail.readiness;
  },
});

export const getProjectsWorkspace = query({
  args: {},
  handler: async (ctx) => getOwnedProjectsWorkspace(ctx, await requireDeveloperAccess(ctx)),
});

export const getProjectWorkspaceDetail = query({
  args: { projectId: v.string() },
  handler: async (ctx, { projectId }) => getOwnedProjectWorkspaceDetail(ctx, projectId, await requireDeveloperAccess(ctx)),
});

export const saveProjectDossierDraft = mutation({
  args: projectDossierDraftInputValidator,
  handler: async (ctx, args) => saveOwnedProjectDossierDraft(ctx, args, await requireDeveloperAccess(ctx)),
});

export const saveProjectUnits = mutation({
  args: { propertyId: v.id("properties"), units: v.array(projectUnitInputValidator) },
  handler: async (ctx, { propertyId, units }) => saveOwnedProjectUnits(ctx, propertyId, units, await requireDeveloperAccess(ctx)),
});

export const applyProjectUnitBulkActions = mutation({
  args: { propertyId: v.id("properties"), actions: v.array(projectUnitBulkActionValidator) },
  handler: async (ctx, { propertyId, actions }) => applyOwnedProjectUnitBulkActions(ctx, propertyId, actions as any, await requireDeveloperAccess(ctx)),
});

export const archiveProject = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => archiveOwnedProject(ctx, propertyId, await requireDeveloperAccess(ctx)),
});

export const saveProjectPaymentPlans = mutation({
  args: { propertyId: v.id("properties"), paymentPlans: v.array(projectPaymentPlanInputValidator) },
  handler: async (ctx, { propertyId, paymentPlans }) => saveOwnedProjectPaymentPlans(ctx, propertyId, paymentPlans, await requireDeveloperAccess(ctx)),
});

export const saveProjectComplianceDocuments = mutation({
  args: { propertyId: v.id("properties"), documents: v.array(projectComplianceDocumentInputValidator) },
  handler: async (ctx, { propertyId, documents }) => saveOwnedProjectComplianceDocuments(ctx, propertyId, documents, await requireDeveloperAccess(ctx)),
});

export const saveProjectAdLicense = mutation({
  args: { propertyId: v.id("properties"), adLicense: v.optional(projectAdLicenseInputValidator) },
  handler: async (ctx, { propertyId, adLicense }) => saveOwnedProjectAdLicense(ctx, propertyId, adLicense, await requireDeveloperAccess(ctx)),
});

export const saveProjectBrokerAuthorization = mutation({
  args: { propertyId: v.id("properties"), authorization: v.optional(projectBrokerAuthorizationInputValidator) },
  handler: async (ctx, { propertyId, authorization }) => saveOwnedProjectBrokerAuthorization(ctx, propertyId, authorization, await requireDeveloperAccess(ctx)),
});

export const requestProjectPublication = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => requestOwnedProjectPublication(ctx, propertyId, await requireDeveloperAccess(ctx)),
});

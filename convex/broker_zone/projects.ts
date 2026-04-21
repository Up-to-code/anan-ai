import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import {
  getOwnedProjectDossierDetail,
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
  projectUnitInputValidator,
} from "../shared_logic/projects/validation";

async function requireBrokerAccess(ctx: any) {
  const access = await requireRole(ctx, ["broker"]);
  return { authUserId: access.authUserId, role: access.role, brokerId: access.brokerId };
}

/**
 * WHY:   Broker workspace needs the same dossier truth as developer workspace with broker ownership enforcement.
 * WHAT:  Returns one owner-scoped Saudi project dossier detail.
 * HOW:   Delegates joins, readiness, and access checks to shared project operations.
 */
export const getProjectDossier = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => getOwnedProjectDossierDetail(ctx, propertyId, await requireBrokerAccess(ctx)),
});

export const getProjectReadiness = query({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    const detail = await getOwnedProjectDossierDetail(ctx, propertyId, await requireBrokerAccess(ctx));
    return detail.readiness;
  },
});

export const saveProjectDossierDraft = mutation({
  args: projectDossierDraftInputValidator,
  handler: async (ctx, args) => saveOwnedProjectDossierDraft(ctx, args, await requireBrokerAccess(ctx)),
});

export const saveProjectUnits = mutation({
  args: { propertyId: v.id("properties"), units: v.array(projectUnitInputValidator) },
  handler: async (ctx, { propertyId, units }) => saveOwnedProjectUnits(ctx, propertyId, units, await requireBrokerAccess(ctx)),
});

export const saveProjectPaymentPlans = mutation({
  args: { propertyId: v.id("properties"), paymentPlans: v.array(projectPaymentPlanInputValidator) },
  handler: async (ctx, { propertyId, paymentPlans }) => saveOwnedProjectPaymentPlans(ctx, propertyId, paymentPlans, await requireBrokerAccess(ctx)),
});

export const saveProjectComplianceDocuments = mutation({
  args: { propertyId: v.id("properties"), documents: v.array(projectComplianceDocumentInputValidator) },
  handler: async (ctx, { propertyId, documents }) => saveOwnedProjectComplianceDocuments(ctx, propertyId, documents, await requireBrokerAccess(ctx)),
});

export const saveProjectAdLicense = mutation({
  args: { propertyId: v.id("properties"), adLicense: v.optional(projectAdLicenseInputValidator) },
  handler: async (ctx, { propertyId, adLicense }) => saveOwnedProjectAdLicense(ctx, propertyId, adLicense, await requireBrokerAccess(ctx)),
});

export const saveProjectBrokerAuthorization = mutation({
  args: { propertyId: v.id("properties"), authorization: v.optional(projectBrokerAuthorizationInputValidator) },
  handler: async (ctx, { propertyId, authorization }) => saveOwnedProjectBrokerAuthorization(ctx, propertyId, authorization, await requireBrokerAccess(ctx)),
});

export const requestProjectPublication = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => requestOwnedProjectPublication(ctx, propertyId, await requireBrokerAccess(ctx)),
});

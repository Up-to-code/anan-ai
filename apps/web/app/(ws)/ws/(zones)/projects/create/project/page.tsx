import ProjectFormScreen from "../../shared/forms/ProjectFormScreen";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceLocale } from "../../../../_lib/workspaceLocale";
import { getWorkspaceProjectZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import {
  mapWorkspaceProjectToAdLicenseInput,
  mapWorkspaceProjectToBrokerAuthorizationInput,
  mapWorkspaceProjectToComplianceDocumentInputs,
  mapWorkspaceProjectToDossierInput,
  mapWorkspaceProjectToPaymentPlanInputs,
  mapWorkspaceProjectToPropertyInput,
  mapWorkspaceProjectToUnitInputs,
} from "../../shared/lib/projectViewModel";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { type AppLocale } from "@/lib/locale";
import { toProjectFormActionFailure, validateProjectFormSubmission } from "../../shared/forms/projectFormSubmission";

/**
 * WHY:   Projects need a direct-mode creation route to complement AI-driven draft creation.
 * WHAT:  Renders the server-backed create-project flow after the inventory type selector.
 * HOW:   Resolves workspace behavior once, then saves through the audience-specific property server functions.
 */
export default async function CreateProjectPage() {
  const locale: AppLocale = await getWorkspaceLocale();
  const workspace = await requireWorkspaceData("/ws/projects/create/project");
  const title =
    locale === "fr"
      ? "Configurer un nouveau projet"
      : locale === "en"
        ? "Set up a new project"
        : "إعداد مشروع جديد";
  const description =
    locale === "fr"
      ? "Suivez les etapes pour saisir les details du projet, organiser la galerie, definir l'acces, puis revoir la version finale avant d'enregistrer."
      : locale === "en"
        ? "Follow the steps to enter project details, organize the gallery, set access, and review the final version before saving."
        : "اتبع الخطوات لإدخال بيانات المشروع، ترتيب المعرض، ضبط الوصول، ثم مراجعة النسخة النهائية قبل الحفظ.";

  async function createProject(data: import("@/app/(ws)/ws/public").ProjectFormData) {
    "use server";

    const validationFeedback = validateProjectFormSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const actionWorkspace = await requireWorkspaceData("/ws/projects/create/project");
      const resolvedAudience =
        actionWorkspace.audience === "none" ? workspace.audience : actionWorkspace.audience;
      const resolvedOwnerContext =
        actionWorkspace.ownerContext ?? workspace.ownerContext ?? null;
      const propertiesZone = getWorkspacePropertyZone(
        resolvedAudience,
        resolvedOwnerContext,
      );
      const projectsZone = getWorkspaceProjectZone(
        resolvedAudience,
        resolvedOwnerContext,
      );
      const id = await propertiesZone.createProperty(mapWorkspaceProjectToPropertyInput(data));
      const dossierResult = await projectsZone.saveProjectDossierDraft(mapWorkspaceProjectToDossierInput(id, data));
      await projectsZone.saveProjectUnits({ propertyId: id, units: mapWorkspaceProjectToUnitInputs(data) });
      await projectsZone.saveProjectPaymentPlans({ propertyId: id, paymentPlans: mapWorkspaceProjectToPaymentPlanInputs(data) });
      await projectsZone.saveProjectComplianceDocuments({ propertyId: id, documents: mapWorkspaceProjectToComplianceDocumentInputs(data) });
      await projectsZone.saveProjectAdLicense({ propertyId: id, adLicense: mapWorkspaceProjectToAdLicenseInput(data) });
      await projectsZone.saveProjectBrokerAuthorization({ propertyId: id, authorization: mapWorkspaceProjectToBrokerAuthorizationInput(data) });
      const session = await requireSessionContext();
      const imageKeys = data.images.map((image) => image.key);
      const permitKeys = data.privatePermitFiles.map((file) => file.key);

      if (imageKeys.length > 0) {
        await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
          keys: imageKeys,
          attachedEntityType: "project",
          attachedEntityId: id,
          visibilityScope: data.clientVisibility === "public" ? "public_project" : "organization",
        });
      }

      if (permitKeys.length > 0) {
        await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
          keys: permitKeys,
          attachedEntityType: "project",
          attachedEntityId: id,
          visibilityScope: "project_private_share",
        });
      }

      return { ok: true, redirectTo: `/ws/projects/${dossierResult.dossierId ?? id}/units` } as const;
    } catch (error) {
      return toProjectFormActionFailure(error);
    }
  }

  return (
    <ProjectFormScreen
      title={title}
      description={description}
      submitLabel={locale === "fr" ? "Enregistrer le projet" : locale === "en" ? "Save project" : "حفظ المشروع"}
      onSave={createProject}
    />
  );
}

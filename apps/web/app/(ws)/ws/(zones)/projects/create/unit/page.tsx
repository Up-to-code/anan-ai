import AgUnitCreateForm from "@/app/(ws)/ws/_components/AgUi/AgUnitCreateForm";
import { requireWorkspaceData } from "../../../../_lib/workspaceData";
import { getWorkspaceLocale } from "../../../../_lib/workspaceLocale";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { type AppLocale } from "@/lib/locale";
import { getWorkspaceProjectZone, getWorkspacePropertyZone } from "@/server/ws/zones";
import {
  mapUnitCreateToAdLicenseInput,
  mapUnitCreateToComplianceDocumentInputs,
  mapUnitCreateToDossierInput,
  mapUnitCreateToPaymentPlanInputs,
  mapUnitCreateToPropertyInput,
  mapUnitCreateToUnitInputs,
  toUnitCreateActionFailure,
  validateUnitCreateSubmission,
  type UnitCreateFormData,
} from "../../shared/forms/unitFormSubmission";

/**
 * WHY:   Brokers and developers sometimes need to add a single saleable unit outside a full project wizard.
 * WHAT:  Renders the standalone unit create flow and saves it through Anan's project/property services.
 * HOW:   Creates a property projection, a dossier draft, and one project-unit record in a server action.
 */
export default async function CreateUnitPage() {
  const locale: AppLocale = await getWorkspaceLocale();
  const workspace = await requireWorkspaceData("/ws/projects/create/unit");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const title =
    locale === "fr"
      ? "Créer une unité autonome"
      : locale === "en"
        ? "Create a standalone unit"
        : "إنشاء وحدة مستقلة";
  const description =
    locale === "fr"
      ? "Ajoutez une unité vendable avec les détails essentiels, puis enregistrez-la dans le même flux d'inventaire Anan."
      : locale === "en"
        ? "Add one saleable unit with the essential details, then save it into the same Anan inventory pipeline."
        : "أضف وحدة قابلة للبيع بالبيانات الأساسية، ثم احفظها داخل نفس مسار مخزون عنان.";

  async function createUnit(data: UnitCreateFormData) {
    "use server";

    const validationFeedback = validateUnitCreateSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
      const projectsZone = getWorkspaceProjectZone(audience, ownerContext);
      const id = await propertiesZone.createProperty(mapUnitCreateToPropertyInput(data));
      const dossierResult = await projectsZone.saveProjectDossierDraft(mapUnitCreateToDossierInput(id, data));
      await projectsZone.saveProjectUnits({ propertyId: id, units: mapUnitCreateToUnitInputs(data) });
      await projectsZone.saveProjectPaymentPlans({ propertyId: id, paymentPlans: mapUnitCreateToPaymentPlanInputs(data) });
      await projectsZone.saveProjectComplianceDocuments({ propertyId: id, documents: mapUnitCreateToComplianceDocumentInputs(data) });
      await projectsZone.saveProjectAdLicense({ propertyId: id, adLicense: mapUnitCreateToAdLicenseInput(data) });

      const session = await requireSessionContext();
      const imageKeys = data.images.map((image) => image.key);
      const permitKeys = data.privatePermitFiles.map((file) => file.key);

      if (imageKeys.length > 0) {
        await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
          keys: imageKeys,
          attachedEntityType: "project",
          attachedEntityId: id,
          visibilityScope: "organization",
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
      return toUnitCreateActionFailure(error);
    }
  }

  return (
    <AgUnitCreateForm
      mode="standalone"
      title={title}
      description={description}
      submitLabel={locale === "fr" ? "Enregistrer l'unité" : locale === "en" ? "Save unit" : "حفظ الوحدة"}
      cancelHref="/ws/projects/create"
      onSave={createUnit}
    />
  );
}

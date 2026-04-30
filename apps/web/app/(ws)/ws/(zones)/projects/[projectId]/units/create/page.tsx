import { notFound } from "next/navigation";
import AgUnitCreateForm from "@/app/(ws)/ws/_components/AgUi/AgUnitCreateForm";
import { buildLocationValueFromParts } from "@anan/location-map";
import { requireWorkspaceData } from "../../../../../_lib/workspaceData";
import { getWorkspaceLocale } from "../../../../../_lib/workspaceLocale";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizations/assets";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import type { AppLocale } from "@/lib/locale";
import type { ProjectDossierDetail } from "@/server/contracts/projects";
import {
  mapUnitCreateToChildUnitInput,
  toUnitCreateActionFailure,
  validateUnitCreateSubmission,
  type UnitCreateFormData,
} from "../../../shared/forms/unitFormSubmission";

type CreateProjectUnitPageProps = {
  params: Promise<{ projectId: string }>;
};

const UNIT_CREATE_TYPES: UnitCreateFormData["unitType"][] = [
  "apartment",
  "villa",
  "duplex",
  "studio",
  "penthouse",
  "townhouse",
  "commercial",
];

function formatProjectLocation(dossier: NonNullable<ProjectDossierDetail["dossier"]>) {
  return [dossier?.location?.city, dossier?.location?.district].filter(Boolean).join("، ");
}

function normalizeUnitType(value?: string): UnitCreateFormData["unitType"] | undefined {
  return UNIT_CREATE_TYPES.find((type) => type === value);
}

function buildProjectUnitInitialData(detail: ProjectDossierDetail): Partial<UnitCreateFormData> {
  const dossier = detail.dossier;
  if (!dossier) {
    return {};
  }

  const primaryPaymentPlan = detail.paymentPlans?.[0];

  return {
    location: formatProjectLocation(dossier) || detail.property.location || detail.property.address || "",
    locationDetails: buildLocationValueFromParts({
      label: formatProjectLocation(dossier) || detail.property.location || detail.property.address || "",
      city: dossier.location.city,
      district: dossier.location.district,
      latitude: dossier.location.latitude,
      longitude: dossier.location.longitude,
    }),
    description: dossier.summary ?? detail.property.description ?? "",
    unitType: normalizeUnitType(dossier.primaryUnitType),
    price: dossier.averagePrice ? String(dossier.averagePrice) : "",
    paymentPlanTitle: primaryPaymentPlan?.title ?? "",
    downPayment: primaryPaymentPlan?.downPayment ? String(primaryPaymentPlan.downPayment) : "",
    services: dossier.services ?? [],
    status: "available",
  };
}

/**
 * WHY:   Creating a unit from inside a project should add inventory to that project only.
 * WHAT:  Renders the unit wizard in project-child mode and writes one `projectUnits` row.
 * HOW:   Resolves the canonical dossier/property pair, then uses project bulk actions instead of property creation.
 */
export default async function CreateProjectUnitPage({ params }: CreateProjectUnitPageProps) {
  const { projectId } = await params;
  const locale: AppLocale = await getWorkspaceLocale();
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/units/create`);
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const workspaceDetail = await projectsZone.getProjectWorkspaceDetail({ projectId }).catch(() => null);
  const canonicalDossier = workspaceDetail ?? await projectsZone.getProjectDossierByProjectId({ projectId }).catch(() => null);
  const dossierDetail = canonicalDossier ?? await projectsZone.getProjectDossier({ propertyId: projectId }).catch(() => null);
  const propertyId = dossierDetail?.property?._id;
  const parentProjectId = dossierDetail?.dossier?._id ?? projectId;

  if (!dossierDetail?.dossier || !propertyId) {
    notFound();
  }
  const parentPropertyId = propertyId;

  async function createProjectUnit(data: UnitCreateFormData) {
    "use server";

    const validationFeedback = validateUnitCreateSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const result = await getWorkspaceProjectZone(workspace.audience, workspace.ownerContext).applyProjectUnitBulkActions({
        propertyId: parentPropertyId,
        actions: [{ type: "create", unit: mapUnitCreateToChildUnitInput(data) }],
      });
      const session = await requireSessionContext();
      const imageKeys = data.images.map((image) => image.key).filter((key): key is string => Boolean(key));

      if (imageKeys.length > 0) {
        await convexOrganizationAssetsRepository.attachOrganizationAssets(session.token, {
          keys: imageKeys,
          attachedEntityType: "project",
          attachedEntityId: parentPropertyId,
          visibilityScope: "organization",
        });
      }

      const unitId = result.createdUnitIds?.[0];
      return {
        ok: true,
        redirectTo: unitId ? `/ws/projects/${parentProjectId}/units/${unitId}` : `/ws/projects/${parentProjectId}/units`,
      } as const;
    } catch (error) {
      return toUnitCreateActionFailure(error);
    }
  }

  return (
    <AgUnitCreateForm
      mode="project_child"
      title={locale === "en" ? "Add unit inside project" : locale === "fr" ? "Ajouter une unite au projet" : "إضافة وحدة داخل المشروع"}
      description={
        locale === "en"
          ? `Create a unit inside ${dossierDetail.dossier.title}. Project location, services, average price, and payment plan defaults are prefilled.`
          : locale === "fr"
            ? `Ajoutez une unite dans ${dossierDetail.dossier.title} avec les valeurs du projet pre-remplies.`
            : `أضف وحدة داخل ${dossierDetail.dossier.title}. تم تعبئة الموقع والخدمات ومتوسط السعر وخطة الدفع من بيانات المشروع.`
      }
      submitLabel={locale === "en" ? "Save unit" : locale === "fr" ? "Enregistrer l'unite" : "حفظ الوحدة"}
      cancelHref={`/ws/projects/${parentProjectId}/units`}
      initialData={buildProjectUnitInitialData(dossierDetail)}
      onSave={createProjectUnit}
    />
  );
}

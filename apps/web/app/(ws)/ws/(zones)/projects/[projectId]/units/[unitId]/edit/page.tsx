import { notFound } from "next/navigation";
import AgUnitCreateForm from "@/app/(ws)/ws/_components/AgUi/AgUnitCreateForm";
import { buildLocationValueFromParts } from "@anan/location-map";
import { requireWorkspaceData } from "../../../../../../_lib/workspaceData";
import { getWorkspaceLocale } from "../../../../../../_lib/workspaceLocale";
import { getWorkspaceProjectZone } from "@/server/ws/zones";
import type { AppLocale } from "@/lib/locale";
import {
  mapProjectUnitRecordToUnitCreateFormData,
  mapUnitCreateToChildUnitInput,
  toUnitCreateActionFailure,
  validateUnitCreateSubmission,
  type UnitCreateFormData,
} from "../../../../shared/forms/unitFormSubmission";

type EditProjectUnitPageProps = {
  params: Promise<{ projectId: string; unitId: string }>;
};

function formatProjectLocation(dossier: any) {
  return [dossier?.location?.city, dossier?.location?.district].filter(Boolean).join("، ");
}

/**
 * WHY:   Child project units need an edit path that updates only their row.
 * WHAT:  Loads one unit from the parent dossier and reuses the unit wizard with initial data.
 * HOW:   Applies a single project-unit bulk update and redirects back to unit detail.
 */
export default async function EditProjectUnitPage({ params }: EditProjectUnitPageProps) {
  const { projectId, unitId } = await params;
  const locale: AppLocale = await getWorkspaceLocale();
  const workspace = await requireWorkspaceData(`/ws/projects/${projectId}/units/${unitId}/edit`);
  const projectsZone = getWorkspaceProjectZone(workspace.audience, workspace.ownerContext);
  const canonicalDossier = await projectsZone.getProjectDossierByProjectId({ projectId }).catch(() => null);
  const dossierDetail = canonicalDossier ?? await projectsZone.getProjectDossier({ propertyId: projectId }).catch(() => null);
  const propertyId = dossierDetail?.property?._id;
  const parentProjectId = dossierDetail?.dossier?._id ?? projectId;
  const unit = dossierDetail?.units?.find((candidate) => candidate._id === unitId);

  if (!dossierDetail?.dossier || !propertyId || !unit) {
    notFound();
  }
  const parentPropertyId = propertyId;

  async function updateProjectUnit(data: UnitCreateFormData) {
    "use server";

    const validationFeedback = validateUnitCreateSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const { dossierId, ...patch } = mapUnitCreateToChildUnitInput(data);
      void dossierId;
      await getWorkspaceProjectZone(workspace.audience, workspace.ownerContext).applyProjectUnitBulkActions({
        propertyId: parentPropertyId,
        actions: [{ type: "update", unitId, patch }],
      });
      return { ok: true, redirectTo: `/ws/projects/${parentProjectId}/units/${unitId}` } as const;
    } catch (error) {
      return toUnitCreateActionFailure(error);
    }
  }

  return (
    <AgUnitCreateForm
      mode="project_child"
      title={locale === "en" ? "Edit project unit" : locale === "fr" ? "Modifier l'unite" : "تعديل الوحدة"}
      description={dossierDetail.dossier.title}
      submitLabel={locale === "en" ? "Save changes" : locale === "fr" ? "Enregistrer" : "حفظ التعديل"}
      cancelHref={`/ws/projects/${parentProjectId}/units/${unitId}`}
      initialData={mapProjectUnitRecordToUnitCreateFormData(unit, {
        location: formatProjectLocation(dossierDetail.dossier),
        locationDetails: buildLocationValueFromParts({
          label: formatProjectLocation(dossierDetail.dossier),
          city: dossierDetail.dossier.location.city,
          district: dossierDetail.dossier.location.district,
          latitude: dossierDetail.dossier.location.latitude,
          longitude: dossierDetail.dossier.location.longitude,
        }),
        description: dossierDetail.dossier.summary ?? "",
      })}
      onSave={updateProjectUnit}
    />
  );
}

import ProjectFormScreen from "../ProjectFormScreen";
import { cookies } from "next/headers";
import { requireWorkspaceData } from "../../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapWorkspaceProjectToPropertyInput } from "../projectViewModel";
import { requireSessionContext } from "@/server/auth/session";
import { convexOrganizationAssetsRepository } from "@/server/infrastructure/convex/organizationAssetsRepository";
import { getWebDictionary } from "@/lib/i18n";
import { type AppLocale, resolveLocale, WEB_LOCALE_COOKIE } from "@/lib/locale";
import { toProjectFormActionFailure, validateProjectFormSubmission } from "../projectFormSubmission";

/**
 * WHY:   Projects need a direct-mode creation route to complement AI-driven draft creation.
 * WHAT:  Renders the server-backed create-project flow.
 * HOW:   Resolves workspace behavior once, then saves through the audience-specific property server functions.
 */
export default async function CreateProjectPage() {
  let locale: AppLocale = "ar";
  try {
    const cookieStore = await cookies();
    locale = resolveLocale(cookieStore.get(WEB_LOCALE_COOKIE)?.value);
  } catch {
    locale = "ar";
  }
  const dictionary = getWebDictionary(locale);
  const workspace = await requireWorkspaceData("/ws/projects/create");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;

  async function createProject(data: import("@/app/(ws)/ws/public").ProjectFormData) {
    "use server";

    const validationFeedback = validateProjectFormSubmission(data);
    if (validationFeedback) {
      return { ok: false, feedback: validationFeedback } as const;
    }

    try {
      const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
      const id = await propertiesZone.createProperty(mapWorkspaceProjectToPropertyInput(data));
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

      return { ok: true, redirectTo: `/ws/projects/${id}` } as const;
    } catch (error) {
      return toProjectFormActionFailure(error);
    }
  }

  return (
    <ProjectFormScreen
      title={dictionary.projects.create}
      description={dictionary.projects.description}
      submitLabel={locale === "fr" ? "Enregistrer le projet" : locale === "en" ? "Save project" : "حفظ المشروع"}
      onSave={createProject}
    />
  );
}

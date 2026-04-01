import ProjectsPage from "./ProjectsPage";
import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspacePropertyZone } from "@/server/ws/zones";
import { mapPropertyToWorkspaceProject } from "./projectViewModel";
import { normalizeDomainError } from "@/server/contracts/errors";
import type { ProjectMutationActionResult } from "./ProjectsPage/actionTypes";

/**
 * WHY:   The projects root route should stay SSR-first while keeping broker-vs-developer branching out of the UI.
 * WHAT:  Loads the real property portfolio and renders the interactive projects workspace.
 * HOW:   Resolves the workspace audience once, then maps property DTOs into the route view model.
 */
export default async function WorkspaceProjectsRoute() {
  const workspace = await requireWorkspaceData("/ws/projects");
  const audience = workspace.audience;
  const ownerContext = workspace.ownerContext ?? null;
  const propertiesZone = getWorkspacePropertyZone(audience, ownerContext);
  const properties = await propertiesZone.listProperties({
    paginationOpts: { cursor: null, numItems: 100 },
  });

  async function deleteProject(projectId: string): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(audience, ownerContext).deleteProperty({ id: projectId });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

  async function publishProject(projectId: string): Promise<ProjectMutationActionResult> {
    "use server";

    try {
      await getWorkspacePropertyZone(audience, ownerContext).publishProperty({ id: projectId });
      return { ok: true };
    } catch (error) {
      const domainError = normalizeDomainError(error);
      return { ok: false, code: domainError.code, message: domainError.message };
    }
  }

  return (
    <ProjectsPage
      projects={properties.page.map(mapPropertyToWorkspaceProject)}
      onDeleteProject={deleteProject}
      onPublishProject={publishProject}
    />
  );
}

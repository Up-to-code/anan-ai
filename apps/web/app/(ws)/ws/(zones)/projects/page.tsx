import ProjectsPage from "./pages/ProjectsPage";
import { loadProjectsWorkspace } from "./loaders/projectWorkspace";

/**
 * WHY:   The projects root route should stay SSR-first while keeping broker-vs-developer branching out of the UI.
 * WHAT:  Loads the real property portfolio and renders the interactive projects workspace.
 * HOW:   Resolves the workspace audience once, then maps property DTOs into the route view model.
 */
export default async function WorkspaceProjectsRoute() {
  const workspace = await loadProjectsWorkspace();

  return (
    <ProjectsPage
      audience={workspace.audience}
      projects={workspace.projects}
    />
  );
}

import type { WorkspaceProject } from "../projectTypes";
import ProjectsWorkspace from "./ProjectsWorkspace";

type ProjectsPageProps = {
  projects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onPublishProject?: (projectId: string) => Promise<void>;
};

/**
 * WHY:   Keep the route file focused on data loading while the page folder owns UI composition.
 * WHAT:  Bridges the route-level props into the client workspace component.
 * HOW:   Passes server-loaded projects and supported server actions to `ProjectsWorkspace`.
 */
export default function ProjectsPage({
  projects,
  onDeleteProject,
  onPublishProject,
}: ProjectsPageProps) {
  return (
    <ProjectsWorkspace
      initialProjects={projects}
      onDeleteProject={onDeleteProject}
      onPublishProject={onPublishProject}
    />
  );
}

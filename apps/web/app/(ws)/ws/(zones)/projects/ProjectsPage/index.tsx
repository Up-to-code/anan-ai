import type { WorkspaceProject } from "../projectTypes";
import ProjectsWorkspace from "./ProjectsWorkspace";

/**
 * WHY:   The projects route needs one thin page-level orchestrator that assembles the workspace view from local parts.
 * WHAT:  Renders the developer projects header, summary strip, empty state, and inventory list.
 * HOW:   Computes the publication summary from the loaded properties and keeps all route-specific UI inside this folder.
 */
export default function ProjectsPage({
  projects,
  onDeleteProject,
  onPublishProject,
}: {
  projects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<void>;
  onPublishProject?: (projectId: string) => Promise<void>;
}) {
  return (
    <ProjectsWorkspace
      initialProjects={projects}
      onDeleteProject={onDeleteProject}
      onPublishProject={onPublishProject}
    />
  );
}

import type { WorkspaceProject } from "../../types/projectTypes";
import type { ProjectMutationActionResult } from "./actionTypes";
import type { ProjectAnalyticsEventType } from "@/server/contracts/properties";
import ProjectsWorkspace from "./ProjectsWorkspace";

type ProjectsPageProps = {
  projects: WorkspaceProject[];
  onDeleteProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
  onPublishProject?: (projectId: string) => Promise<ProjectMutationActionResult>;
  onTrackProjectEvent?: (input: {
    id: string;
    eventType: ProjectAnalyticsEventType;
    source: string;
  }) => Promise<{ ok: true }>;
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
  onTrackProjectEvent,
}: ProjectsPageProps) {
  return (
    <ProjectsWorkspace
      initialProjects={projects}
      onDeleteProject={onDeleteProject}
      onPublishProject={onPublishProject}
      onTrackProjectEvent={onTrackProjectEvent}
    />
  );
}

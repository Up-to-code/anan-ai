import type { WorkspaceProject } from "../../types/projectTypes";
import type { WorkspaceAudience } from "@/server/contracts/workspace";
import ProjectsWorkspace from "./ProjectsWorkspace";

type ProjectsPageProps = {
  audience: WorkspaceAudience;
  projects: WorkspaceProject[];
};

/**
 * WHY:   Keep the route file focused on data loading while the page folder owns UI composition.
 * WHAT:  Bridges the route-level props into the client workspace component.
 * HOW:   Passes server-loaded projects and supported server actions to `ProjectsWorkspace`.
 */
export default function ProjectsPage({
  audience,
  projects,
}: ProjectsPageProps) {
  return (
    <ProjectsWorkspace
      audience={audience}
      initialProjects={projects}
    />
  );
}

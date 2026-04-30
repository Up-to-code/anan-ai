import ProjectDetailOverview from "../../components/ProjectDetail/ProjectDetailOverview";
import type { WorkspaceProject } from "../../types/projectTypes";

type ProjectDetailPageProps = {
  project: WorkspaceProject;
};

/**
 * WHY:   The overview route should only render overview content; project chrome lives in the nested layout.
 * WHAT:  Renders the project overview section.
 * HOW:   Receives an already loaded workspace project view model from the route loader.
 */
export default function ProjectDetailPage({ project }: ProjectDetailPageProps) {
  return <ProjectDetailOverview project={project} />;
}

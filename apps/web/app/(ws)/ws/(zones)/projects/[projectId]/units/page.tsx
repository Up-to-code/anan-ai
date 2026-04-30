import { notFound } from "next/navigation";
import ProjectDetailUnits from "../../components/ProjectDetail/ProjectDetailUnits";
import { loadProjectWorkspaceDetail } from "../../loaders/projectWorkspace";
import { getAvailableProjectDetailModes } from "../../shared/lib/projectUi";

type WorkspaceProjectUnitsRouteProps = {
  params: Promise<{ projectId: string }>;
};

export default async function WorkspaceProjectUnitsRoute({
  params,
}: WorkspaceProjectUnitsRouteProps) {
  const { projectId } = await params;
  const detail = await loadProjectWorkspaceDetail(projectId);
  if (!detail || !getAvailableProjectDetailModes(detail.project).includes("units")) {
    notFound();
  }

  return <ProjectDetailUnits project={detail.project} />;
}

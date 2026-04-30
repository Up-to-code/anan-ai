import { notFound, redirect } from "next/navigation";
import ProjectDetailPage from "../pages/ProjectDetailPage";
import { loadProjectWorkspaceDetail } from "../loaders/projectWorkspace";

type WorkspaceProjectDetailRouteProps = {
  params: Promise<{ projectId: string }>;
  searchParams?: Promise<{ tab?: string }>;
};

export default async function WorkspaceProjectDetailRoute({
  params,
  searchParams,
}: WorkspaceProjectDetailRouteProps) {
  const [{ projectId }, query] = await Promise.all([
    params,
    searchParams ?? Promise.resolve({} as { tab?: string }),
  ]);
  if (query.tab === "units") {
    redirect(`/ws/projects/${projectId}/units`);
  }
  if (query.tab === "analytics") {
    redirect(`/ws/projects/${projectId}/analytics`);
  }

  const detail = await loadProjectWorkspaceDetail(projectId);
  if (!detail) {
    notFound();
  }

  return <ProjectDetailPage project={detail.project} />;
}

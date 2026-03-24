import ProjectDetailPage from "@/admin_zone/pages/ProjectDetailPage";

type ProjectDetailRouteProps = {
  params: Promise<{ projectId: string }>;
};

/**
 * WHY:   The project detail route should only resolve the dynamic segment and pass it through.
 * WHAT:  Renders the mocked project detail page.
 * HOW:   Awaits the `projectId` param and forwards it to the page module.
 */
export default async function ProjectDetailRoute({ params }: ProjectDetailRouteProps) {
  const { projectId } = await params;
  return <ProjectDetailPage projectId={projectId} />;
}


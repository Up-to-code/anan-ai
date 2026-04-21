import ProjectReadinessDetailPage from "@/admin_zone/pages/ProjectReadinessDetailPage";

export default async function ProjectReadinessDetailRoute({
  params,
}: {
  params: Promise<{ dossierId: string }>;
}) {
  const { dossierId } = await params;
  return <ProjectReadinessDetailPage dossierId={dossierId} />;
}

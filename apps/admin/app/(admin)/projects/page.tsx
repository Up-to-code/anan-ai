import ProjectReadinessPage from "@/admin_zone/pages/ProjectReadinessPage";
import type { ProjectReadinessQueueFilter } from "@/server/infrastructure/convex/adminProjectsRepository";

function normalizeFilter(value: string | string[] | undefined): ProjectReadinessQueueFilter {
  const filter = Array.isArray(value) ? value[0] : value;
  if (filter === "pending_review" || filter === "approved" || filter === "blocked" || filter === "expired") return filter;
  return "incomplete";
}

export default async function ProjectsAdminRoute({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string | string[] }>;
}) {
  const params = await searchParams;
  return <ProjectReadinessPage filter={normalizeFilter(params.filter)} />;
}

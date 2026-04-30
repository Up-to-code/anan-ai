import type { ReactNode } from "react";
import ProjectDetailLayoutShell from "../components/ProjectDetail/ProjectDetailLayoutShell";
import { loadProjectWorkspaceDetail } from "../loaders/projectWorkspace";

type ProjectDetailLayoutProps = {
  children: ReactNode;
  params: Promise<{ projectId: string }>;
};

export default async function ProjectDetailLayout({
  children,
  params,
}: ProjectDetailLayoutProps) {
  const { projectId } = await params;
  const detail = await loadProjectWorkspaceDetail(projectId);

  if (!detail) {
    return <>{children}</>;
  }

  return (
    <ProjectDetailLayoutShell project={detail.project}>
      {children}
    </ProjectDetailLayoutShell>
  );
}

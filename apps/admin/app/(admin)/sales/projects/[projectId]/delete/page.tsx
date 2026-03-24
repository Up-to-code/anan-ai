import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getProjectById } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";

type DeleteProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

/**
 * WHY:   Project management needs an explicit confirmation route before destructive actions.
 * WHAT:  Renders the mocked delete confirmation page for a project.
 * HOW:   Resolves the current project name and forwards it to the shared delete page.
 */
export default async function DeleteProjectPage({ params }: DeleteProjectPageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  return (
    <DeleteEntityPage
      eyebrow="المبيعات"
      title="حذف مشروع"
      description="تأكيد حذف المشروع من مساحة الإدارة التجريبية."
      entityLabel="المشروع"
      entityName={project?.name ?? "المشروع"}
      backHref={project ? `/sales/projects/${project.id}` : "/sales/projects"}
      tabs={salesTabs}
    />
  );
}

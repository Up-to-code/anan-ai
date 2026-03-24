import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getProjectById } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";

type EditProjectPageProps = {
  params: Promise<{ projectId: string }>;
};

/**
 * WHY:   Project detail screens need a dedicated edit route for mocked data changes.
 * WHAT:  Renders the project editor using current project values as defaults.
 * HOW:   Loads the project by id and passes normalized defaults into the shared editor page.
 */
export default async function EditProjectPage({ params }: EditProjectPageProps) {
  const { projectId } = await params;
  const project = getProjectById(projectId);

  return (
    <EntityEditorPage
      eyebrow="المبيعات"
      title={`تعديل ${project?.name ?? "المشروع"}`}
      description="تحديث بيانات المشروع وحالة التفعيل داخل الواجهة التجريبية."
      entityLabel="المشروع"
      mode="edit"
      backHref={project ? `/sales/projects/${project.id}` : "/sales/projects"}
      tabs={salesTabs}
      fields={[
        { name: "name", label: "اسم المشروع", defaultValue: project?.name ?? "" },
        { name: "organizationName", label: "اسم المنظمة", defaultValue: project?.organizationName ?? "" },
        { name: "city", label: "المدينة", defaultValue: project?.city ?? "" },
        { name: "stage", label: "المرحلة", type: "select", defaultValue: project?.stage ?? "draft", options: [{ label: "مسودة", value: "draft" }, { label: "نشط", value: "active" }] },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: project?.assistantEnabled ? "true" : "false", options: [{ label: "غير مفعّل", value: "false" }, { label: "مفعّل", value: "true" }] },
        { name: "summary", label: "الوصف", type: "textarea", defaultValue: project?.summary ?? "" },
      ]}
    />
  );
}

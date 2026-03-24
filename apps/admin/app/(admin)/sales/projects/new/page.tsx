import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { salesTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Sales admins need a route-backed create screen for adding projects into the mocked workspace.
 * WHAT:  Renders the new-project form page.
 * HOW:   Delegates to the shared entity editor with project-specific fields only.
 */
export default function NewProjectPage() {
  return (
    <EntityEditorPage
      eyebrow="المبيعات"
      title="إنشاء مشروع"
      description="إضافة مشروع جديد داخل مساحة المشاريع، مع تحديد المرحلة والوصول للمساعد."
      entityLabel="المشروع"
      mode="create"
      backHref="/sales/projects"
      tabs={salesTabs}
      fields={[
        { name: "name", label: "اسم المشروع", placeholder: "مثل ريفان ريزيدنس" },
        { name: "organizationName", label: "اسم المنظمة", placeholder: "اسم المطور أو الوسيط" },
        { name: "city", label: "المدينة", placeholder: "الرياض" },
        { name: "stage", label: "المرحلة", type: "select", defaultValue: "draft", options: [{ label: "مسودة", value: "draft" }, { label: "نشط", value: "active" }] },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: "false", options: [{ label: "غير مفعّل", value: "false" }, { label: "مفعّل", value: "true" }] },
        { name: "summary", label: "الوصف", type: "textarea", placeholder: "ملخص عن المشروع، الفئة، وحالة الجاهزية." },
      ]}
    />
  );
}

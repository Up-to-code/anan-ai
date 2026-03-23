import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";

/**
 * WHY:   Finance admins need a route-backed way to create a new bank record in the mocked workspace.
 * WHAT:  Renders the create-bank form page.
 * HOW:   Delegates to the shared entity editor with bank-specific fields.
 */
export default function NewBankPage() {
  return (
    <EntityEditorPage
      eyebrow="التمويل والبنوك"
      title="إضافة بنك"
      description="إضافة بنك جديد وربطه ببريد التشغيل وحالة وصول المساعد."
      entityLabel="البنك"
      mode="create"
      backHref="/banks"
      fields={[
        { name: "name", label: "اسم البنك", placeholder: "اسم البنك" },
        { name: "slug", label: "الرمز", placeholder: "bank-name" },
        { name: "contactEmail", label: "البريد التشغيلي", type: "email", placeholder: "ops@example.com" },
        { name: "status", label: "الحالة", type: "select", defaultValue: "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "assistantEnabled", label: "الوصول للمساعد", type: "select", defaultValue: "true", options: [{ label: "مفعّل", value: "true" }, { label: "غير مفعّل", value: "false" }] },
        { name: "notes", label: "ملاحظات", type: "textarea", placeholder: "شرح استخدام البنك ومنتجاته." },
      ]}
    />
  );
}

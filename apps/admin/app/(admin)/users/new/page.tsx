import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { newUserTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Platform operators need a create route for adding new users into the mocked admin workspace.
 * WHAT:  Renders the create-user editor page.
 * HOW:   Uses the shared editor with user-specific role and status fields.
 */
export default function NewUserPage() {
  return (
    <EntityEditorPage
      eyebrow="المستخدمون"
      title="إضافة مستخدم"
      description="إضافة مستخدم جديد وتحديد المنظمة والدور والحالة الأولية."
      entityLabel="المستخدم"
      mode="create"
      backHref="/users"
      tabs={newUserTabs}
      fields={[
        { name: "name", label: "الاسم", placeholder: "اسم المستخدم" },
        { name: "email", label: "البريد الإلكتروني", type: "email", placeholder: "user@example.com" },
        { name: "role", label: "الدور", type: "select", defaultValue: "user", options: [{ label: "مستخدم", value: "user" }, { label: "وسيط", value: "broker" }, { label: "مطور", value: "developer" }, { label: "مشرف", value: "admin" }] },
        { name: "organizationName", label: "المنظمة", placeholder: "اسم المنظمة" },
        { name: "status", label: "الحالة", type: "select", defaultValue: "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "verificationStatus", label: "حالة التحقق", type: "select", defaultValue: "pending", options: [{ label: "معلّق", value: "pending" }, { label: "معتمد", value: "approved" }] },
      ]}
    />
  );
}

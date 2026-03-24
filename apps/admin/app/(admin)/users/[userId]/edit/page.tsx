import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getUserById } from "@/admin_zone/mocks/data";
import { userDetailTabs, usersTabs } from "@/lib/adminSectionTabs";

type EditUserPageProps = {
  params: Promise<{ userId: string }>;
};

/**
 * WHY:   User management needs a route-backed editor that starts from the current record values.
 * WHAT:  Renders the edit-user page.
 * HOW:   Resolves the user by id and feeds the defaults into the shared entity editor.
 */
export default async function EditUserPage({ params }: EditUserPageProps) {
  const { userId } = await params;
  const user = getUserById(userId);

  return (
    <EntityEditorPage
      eyebrow="المستخدمون"
      title={`تعديل ${user?.name ?? "المستخدم"}`}
      description="تحديث الدور والحالة وبيانات المستخدم داخل الواجهة التجريبية."
      entityLabel="المستخدم"
      mode="edit"
      backHref={user ? `/users/${user.id}` : "/users"}
      tabs={user ? userDetailTabs(user.id) : usersTabs}
      fields={[
        { name: "name", label: "الاسم", defaultValue: user?.name ?? "" },
        { name: "email", label: "البريد الإلكتروني", type: "email", defaultValue: user?.email ?? "" },
        { name: "role", label: "الدور", type: "select", defaultValue: user?.role ?? "user", options: [{ label: "مستخدم", value: "user" }, { label: "وسيط", value: "broker" }, { label: "مطور", value: "developer" }, { label: "مشرف", value: "admin" }] },
        { name: "organizationName", label: "المنظمة", defaultValue: user?.organizationName ?? "" },
        { name: "status", label: "الحالة", type: "select", defaultValue: user?.status ?? "active", options: [{ label: "نشط", value: "active" }, { label: "غير نشط", value: "inactive" }] },
        { name: "verificationStatus", label: "حالة التحقق", type: "select", defaultValue: user?.verificationStatus ?? "pending", options: [{ label: "معلّق", value: "pending" }, { label: "معتمد", value: "approved" }] },
      ]}
    />
  );
}

import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getUserById } from "@/admin_zone/mocks/data";
import { userDetailTabs, usersTabs } from "@/lib/adminSectionTabs";

type DeleteUserPageProps = {
  params: Promise<{ userId: string }>;
};

/**
 * WHY:   User management needs a dedicated delete confirmation route just like the rest of the CRUD surface.
 * WHAT:  Renders the delete-user page.
 * HOW:   Resolves the user by id and forwards its display name to the shared delete page.
 */
export default async function DeleteUserPage({ params }: DeleteUserPageProps) {
  const { userId } = await params;
  const user = getUserById(userId);

  return (
    <DeleteEntityPage
      eyebrow="المستخدمون"
      title="حذف مستخدم"
      description="تأكيد حذف المستخدم من الدليل التجريبي."
      entityLabel="المستخدم"
      entityName={user?.name ?? "المستخدم"}
      backHref={user ? `/users/${user.id}` : "/users"}
      tabs={user ? userDetailTabs(user.id) : usersTabs}
    />
  );
}

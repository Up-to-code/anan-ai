import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getOrganizationById } from "@/admin_zone/mocks/data";
import { organizationDetailTabs, organizationsTabs } from "@/lib/adminSectionTabs";

type DeleteOrganizationPageProps = {
  params: Promise<{ organizationId: string }>;
};

/**
 * WHY:   Organization CRUD flows need a confirmation route before deletion.
 * WHAT:  Renders the delete-organization page.
 * HOW:   Resolves the organization label and delegates to the shared delete page module.
 */
export default async function DeleteOrganizationPage({ params }: DeleteOrganizationPageProps) {
  const { organizationId } = await params;
  const organization = getOrganizationById(organizationId);

  return (
    <DeleteEntityPage
      eyebrow="المنظمات"
      title="حذف منظمة"
      description="تأكيد حذف المنظمة من قائمة الإدارة التجريبية."
      entityLabel="المنظمة"
      entityName={organization?.name ?? "المنظمة"}
      backHref={organization ? `/organizations/${organization.id}` : "/organizations"}
      tabs={organization ? organizationDetailTabs(organization.id) : organizationsTabs}
    />
  );
}

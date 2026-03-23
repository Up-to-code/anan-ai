import DeleteEntityPage from "@/admin_zone/pages/DeleteEntityPage";
import { getPropertyById } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";

type DeletePropertyPageProps = {
  params: Promise<{ propertyId: string }>;
};

/**
 * WHY:   Inventory flows need a delete confirmation route to mirror the rest of the CRUD UI.
 * WHAT:  Renders the mocked delete page for one property.
 * HOW:   Uses the property id to resolve the display name and back link.
 */
export default async function DeletePropertyPage({ params }: DeletePropertyPageProps) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  return (
    <DeleteEntityPage
      eyebrow="المبيعات"
      title="حذف عقار"
      description="تأكيد حذف العقار من قائمة المخزون التجريبية."
      entityLabel="العقار"
      entityName={property?.title ?? "العقار"}
      backHref={property ? `/sales/properties/${property.id}` : "/sales/properties"}
      tabs={salesTabs}
    />
  );
}

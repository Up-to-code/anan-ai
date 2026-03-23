import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { getPropertyById } from "@/admin_zone/mocks/data";
import { salesTabs } from "@/lib/adminSectionTabs";

type EditPropertyPageProps = {
  params: Promise<{ propertyId: string }>;
};

/**
 * WHY:   Inventory records need an edit route with the current mocked values prefilled.
 * WHAT:  Renders the edit-property form page.
 * HOW:   Loads the property by id and passes its values into the shared entity editor.
 */
export default async function EditPropertyPage({ params }: EditPropertyPageProps) {
  const { propertyId } = await params;
  const property = getPropertyById(propertyId);

  return (
    <EntityEditorPage
      eyebrow="المبيعات"
      title={`تعديل ${property?.title ?? "العقار"}`}
      description="تحديث حالة النشر والمخزون وبيانات الوحدة داخل الواجهة التجريبية."
      entityLabel="العقار"
      mode="edit"
      backHref={property ? `/sales/properties/${property.id}` : "/sales/properties"}
      tabs={salesTabs}
      fields={[
        { name: "title", label: "اسم العقار", defaultValue: property?.title ?? "" },
        { name: "projectName", label: "المشروع", defaultValue: property?.projectName ?? "" },
        { name: "organizationName", label: "المنظمة", defaultValue: property?.organizationName ?? "" },
        { name: "type", label: "النوع", defaultValue: property?.type ?? "" },
        { name: "publicationStatus", label: "حالة النشر", type: "select", defaultValue: property?.publicationStatus ?? "draft", options: [{ label: "مسودة", value: "draft" }, { label: "منشور", value: "published" }] },
        { name: "inventoryStatus", label: "حالة المخزون", type: "select", defaultValue: property?.inventoryStatus ?? "available", options: [{ label: "متاح", value: "available" }, { label: "محجوز", value: "reserved" }, { label: "مباع", value: "sold" }] },
        { name: "price", label: "السعر", type: "number", defaultValue: property?.price ?? 0 },
        { name: "city", label: "المدينة", defaultValue: property?.city ?? "" },
      ]}
    />
  );
}

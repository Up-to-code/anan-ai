import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { salesTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Inventory operations need a route-backed create flow for adding new properties into the mocked catalog.
 * WHAT:  Renders the new-property editor page.
 * HOW:   Uses the shared entity editor with property-specific fields only.
 */
export default function NewPropertyPage() {
  return (
    <EntityEditorPage
      eyebrow="المبيعات"
      title="إضافة عقار"
      description="إضافة وحدة جديدة وربطها بمشروع ومنظمة وحالة نشر."
      entityLabel="العقار"
      mode="create"
      backHref="/sales/properties"
      tabs={salesTabs}
      fields={[
        { name: "title", label: "اسم العقار", placeholder: "مثل شقة غرفتين" },
        { name: "projectName", label: "المشروع", placeholder: "اسم المشروع" },
        { name: "organizationName", label: "المنظمة", placeholder: "اسم المنظمة" },
        { name: "type", label: "النوع", placeholder: "شقة، دوبلكس..." },
        { name: "publicationStatus", label: "حالة النشر", type: "select", defaultValue: "draft", options: [{ label: "مسودة", value: "draft" }, { label: "منشور", value: "published" }] },
        { name: "inventoryStatus", label: "حالة المخزون", type: "select", defaultValue: "available", options: [{ label: "متاح", value: "available" }, { label: "محجوز", value: "reserved" }, { label: "مباع", value: "sold" }] },
        { name: "price", label: "السعر", type: "number", defaultValue: 0 },
        { name: "city", label: "المدينة", placeholder: "الرياض" },
      ]}
    />
  );
}

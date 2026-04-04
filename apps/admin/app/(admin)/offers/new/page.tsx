import EntityEditorPage from "@/admin_zone/pages/EntityEditorPage";
import { newOfferTabs } from "@/lib/adminSectionTabs";

/**
 * WHY:   Offer management needs a route-backed create flow so the CRUD UI feels complete even in mock mode.
 * WHAT:  Renders the create-offer editor page.
 * HOW:   Uses the shared entity editor with offer-specific fields and status options.
 */
export default function NewOfferPage() {
  return (
    <EntityEditorPage
      eyebrow="إدارة العروض"
      title="إضافة عرض"
      description="إضافة عرض جديد مع المنظمة والمشروع والعقار والقيمة المقترحة."
      entityLabel="العرض"
      mode="create"
      backHref="/offers"
      tabs={newOfferTabs}
      fields={[
        { name: "title", label: "عنوان العرض", placeholder: "عنوان واضح للعرض" },
        { name: "organizationName", label: "المنظمة", placeholder: "اسم المنظمة" },
        { name: "submittedBy", label: "المرسل", placeholder: "اسم الشخص" },
        { name: "projectName", label: "المشروع", placeholder: "اسم المشروع" },
        { name: "propertyName", label: "العقار", placeholder: "اسم العقار" },
        { name: "amount", label: "القيمة", type: "number", defaultValue: 0 },
        { name: "status", label: "الحالة", type: "select", defaultValue: "pending", options: [{ label: "معلّق", value: "pending" }, { label: "معتمد", value: "approved" }, { label: "مرفوض", value: "rejected" }] },
        { name: "body", label: "تفاصيل العرض", type: "textarea", placeholder: "وصف مختصر للعرض والشروط." },
      ]}
    />
  );
}

import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import EntityEditorPage from "./index";

describe("EntityEditorPage", () => {
  it("renders a rich property form with organized sections and upload areas", () => {
    const html = renderToStaticMarkup(
      <EntityEditorPage
        eyebrow="المبيعات"
        title="إضافة عقار"
        description="إضافة وحدة جديدة."
        entityLabel="العقار"
        mode="create"
        backHref="/sales/properties"
        fields={[
          { name: "title", label: "اسم العقار" },
          { name: "projectName", label: "المشروع" },
          { name: "publicationStatus", label: "حالة النشر", type: "select", options: [{ label: "منشور", value: "published" }] },
          { name: "summary", label: "الوصف", type: "textarea" },
        ]}
      />,
    );

    expect(html).toContain("المعلومات الأساسية");
    expect(html).toContain("الحالة والإتاحة");
    expect(html).toContain("الوسائط");
    expect(html).toContain("المستندات");
    expect(html).toContain("إضافة صور العقار");
    expect(html).toContain("إرفاق مستندات الترخيص");
  });

  it("renders a standard model form without the rich upload rail", () => {
    const html = renderToStaticMarkup(
      <EntityEditorPage
        eyebrow="إعدادات الذكاء"
        title="إضافة نموذج"
        description="إضافة نموذج جديد."
        entityLabel="النموذج"
        mode="create"
        backHref="/ai-settings/models"
        fields={[
          { name: "name", label: "اسم النموذج" },
          { name: "provider", label: "المزوّد" },
          { name: "status", label: "الحالة", type: "select", options: [{ label: "نشط", value: "active" }] },
          { name: "pricePerMillion", label: "السعر", type: "number" },
        ]}
      />,
    );

    expect(html).toContain("المعلومات الأساسية");
    expect(html).not.toContain("إضافة صور العقار");
    expect(html).not.toContain("إرفاق مستندات الترخيص");
  });
});

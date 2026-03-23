"use client";

import { useMemo, useState } from "react";
import AdminFormActionBar from "@/components/shared/AdminFormActionBar";
import AdminFormField from "@/components/shared/AdminFormField";
import AdminFormPageLayout from "@/components/shared/AdminFormPageLayout";
import AdminFormSection from "@/components/shared/AdminFormSection";
import AdminFormSummaryCard from "@/components/shared/AdminFormSummaryCard";
import { AdminInput, AdminSelect, AdminTextarea } from "@/components/shared/AdminFieldControls";
import AdminUploadField from "@/components/shared/AdminUploadField";

type MockFormField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string | number;
  helpText?: string;
};

type MockEntityFormProps = {
  entityLabel: string;
  mode: "create" | "edit";
  fields: MockFormField[];
  backHref: string;
};

type FormSection = {
  key: string;
  title: string;
  description?: string;
  fields: MockFormField[];
};

function buildSections(entityLabel: string, fields: MockFormField[]): FormSection[] {
  const bucketMap: Array<{ key: string; title: string; description?: string; matches: (field: MockFormField) => boolean }> = [
    {
      key: "basic",
      title: "المعلومات الأساسية",
      description: "أدخل البيانات الرئيسية التي تعرّف هذا العنصر داخل النظام.",
      matches: (field) => ["title", "name", "email", "contactEmail"].includes(field.name),
    },
    {
      key: "relations",
      title: "الربط والتصنيف",
      description: "حدد الكيان المرتبط أو التصنيف التشغيلي المناسب.",
      matches: (field) =>
        ["organizationName", "projectName", "propertyName", "city", "type", "kind", "role", "provider", "team", "submittedBy", "source", "defaultModel", "fallbackModel", "slug"].includes(
          field.name,
        ),
    },
    {
      key: "status",
      title: "الحالة والإتاحة",
      description: "تحكم في حالة الظهور، التفعيل، والوصول التشغيلي.",
      matches: (field) =>
        [
          "stage",
          "status",
          "assistantEnabled",
          "publicationStatus",
          "inventoryStatus",
          "verificationStatus",
          "documentationStatus",
          "visibility",
          "enabled",
        ].includes(field.name),
    },
    {
      key: "details",
      title: entityLabel === "العرض" ? "تفاصيل العرض" : "الوصف والتفاصيل",
      description: "أضف الوصف، الملاحظات، أو البيانات التشغيلية المكملة.",
      matches: (field) =>
        [
          "summary",
          "body",
          "notes",
          "reason",
          "routingRule",
          "budgetBand",
          "price",
          "amount",
          "apr",
          "termYears",
          "monthlyTokens",
          "burnedTokens",
          "pricePerMillion",
        ].includes(field.name) || field.type === "textarea" || field.type === "number",
    },
  ];

  const used = new Set<string>();
  const sections = bucketMap
    .map((bucket) => {
      const bucketFields = fields.filter((field) => {
        const match = bucket.matches(field);
        if (match) used.add(field.name);
        return match;
      });

      return { key: bucket.key, title: bucket.title, description: bucket.description, fields: bucketFields };
    })
    .filter((section) => section.fields.length > 0);

  const remaining = fields.filter((field) => !used.has(field.name));
  if (remaining.length > 0) {
    sections.push({
      key: "extra",
      title: "حقول إضافية",
      description: "حقول أخرى مرتبطة بهذا العنصر.",
      fields: remaining,
    });
  }

  return sections;
}

function showDraftAction(entityLabel: string) {
  return ["العقار", "المشروع", "العرض", "المنظمة", "البنك", "المنتج البنكي"].includes(entityLabel);
}

function showUploadPreset(entityLabel: string) {
  return ["العقار", "المشروع", "العرض", "المنظمة", "البنك", "المنتج البنكي", "المستخدم"].includes(entityLabel);
}

function renderUploadRail(entityLabel: string, setMediaCount: (count: number) => void, setDocumentCount: (count: number) => void) {
  switch (entityLabel) {
    case "العقار":
      return (
        <>
          <AdminUploadField
            title="الوسائط"
            description="أضف صور العقار أو لقطات العرض الرئيسية."
            accept="image/*"
            previewKind="image"
            emptyLabel="إضافة صور العقار"
            badgeLabel="صور"
            icon="image"
            onCountChange={setMediaCount}
          />
          <AdminUploadField
            title="المستندات"
            description="ارفع مستندات الترخيص أو مستندات الإعلان بصيغة ملفات."
            accept=".pdf,image/*"
            previewKind="file"
            emptyLabel="إرفاق مستندات الترخيص"
            badgeLabel="مستندات"
            icon="file"
            onCountChange={setDocumentCount}
          />
          <AdminUploadField
            title="فيديو اختياري"
            description="أضف ملف فيديو واحد لعرض الوحدة بشكل أسرع على الفريق."
            accept="video/*"
            multiple={false}
            previewKind="file"
            emptyLabel="إضافة فيديو اختياري"
            badgeLabel="فيديو"
            icon="video"
          />
        </>
      );
    case "المشروع":
      return (
        <>
          <AdminUploadField
            title="غلاف المشروع ومعرض الصور"
            description="أضف صورة غلاف وصور إضافية للمشروع."
            accept="image/*"
            previewKind="image"
            emptyLabel="إضافة صور المشروع"
            badgeLabel="صور"
            icon="image"
            onCountChange={setMediaCount}
          />
          <AdminUploadField
            title="الملفات"
            description="إرفاق brochure أو ملف عرض المشروع بصيغة PDF أو صورة."
            accept=".pdf,image/*"
            previewKind="file"
            emptyLabel="إرفاق ملفات المشروع"
            badgeLabel="ملفات"
            icon="file"
            onCountChange={setDocumentCount}
          />
        </>
      );
    case "العرض":
      return (
        <AdminUploadField
          title="المرفقات"
          description="أضف الملفات التي يحتاجها فريق المراجعة لفهم العرض بسرعة."
          accept=".pdf,image/*"
          previewKind="file"
          emptyLabel="إرفاق ملفات العرض"
          badgeLabel="مرفقات"
          icon="file"
          onCountChange={setDocumentCount}
        />
      );
    case "المنظمة":
      return (
        <AdminUploadField
          title="وثائق التحقق"
          description="أضف السجل التجاري، الهوية، أو أي وثيقة داعمة لعملية التحقق."
          accept=".pdf,image/*"
          previewKind="file"
          emptyLabel="رفع مستندات التحقق"
          badgeLabel="وثائق"
          icon="file"
          onCountChange={setDocumentCount}
        />
      );
    case "البنك":
      return (
        <>
          <AdminUploadField
            title="هوية البنك"
            description="أضف شعارًا أو صورة تعريفية للبنك."
            accept="image/*"
            multiple={false}
            previewKind="image"
            emptyLabel="رفع شعار البنك"
            badgeLabel="شعار"
            icon="image"
            onCountChange={setMediaCount}
          />
          <AdminUploadField
            title="مستندات السياسات"
            description="ارفع ملفات PDF أو مستندات تشغيل داخلية خاصة بالمنتجات."
            accept=".pdf,image/*"
            previewKind="file"
            emptyLabel="إرفاق ملفات البنك"
            badgeLabel="سياسات"
            icon="file"
            onCountChange={setDocumentCount}
          />
        </>
      );
    case "المنتج البنكي":
      return (
        <AdminUploadField
          title="ملفات المنتج"
          description="أضف product sheet أو معايير الأهلية الخاصة بهذا المنتج."
          accept=".pdf,image/*"
          previewKind="file"
          emptyLabel="إرفاق ملفات المنتج البنكي"
          badgeLabel="منتج"
          icon="file"
          onCountChange={setDocumentCount}
        />
      );
    case "المستخدم":
      return (
        <AdminUploadField
          title="الصورة الشخصية"
          description="إضافة صورة تعريفية للمستخدم داخل الإدارة."
          accept="image/*"
          multiple={false}
          previewKind="image"
          emptyLabel="رفع صورة شخصية"
          badgeLabel="صورة"
          icon="image"
          onCountChange={setMediaCount}
        />
      );
    default:
      return null;
  }
}

/**
 * WHY:   The admin rewrite needs many mocked create/edit screens without introducing duplicated form state logic everywhere.
 * WHAT:  Renders a route-backed admin form with organized sections, mock uploads, and a side summary.
 * HOW:   Groups fields into semantic sections, stores all values locally, and exposes upload/saving interactions without backend writes.
 */
export default function MockEntityForm({ entityLabel, mode, fields, backHref }: MockEntityFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() =>
    Object.fromEntries(fields.map((field) => [field.name, String(field.defaultValue ?? "")])),
  );
  const [saved, setSaved] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [mediaCount, setMediaCount] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const sections = useMemo(() => buildSections(entityLabel, fields), [entityLabel, fields]);

  const submitLabel = mode === "create" ? `إنشاء ${entityLabel}` : `حفظ ${entityLabel}`;
  const panelTitle = mode === "create" ? `إنشاء ${entityLabel}` : `تعديل ${entityLabel}`;
  const displayName = values.title || values.name || `${entityLabel} جديد`;
  const currentStatus =
    values.stage ||
    values.status ||
    values.publicationStatus ||
    values.inventoryStatus ||
    values.verificationStatus ||
    values.documentationStatus ||
    "draft";

  const completionText = useMemo(
    () => (mode === "create" ? `تم تجهيز ${entityLabel} الجديد داخل الواجهة التجريبية.` : `تم تحديث ${entityLabel} داخل الواجهة التجريبية.`),
    [entityLabel, mode],
  );

  function updateValue(name: string, value: string) {
    setSaved(false);
    setDraftSaved(false);
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <AdminFormPageLayout
      sidebar={
        <>
          <AdminFormSummaryCard
            title="ملخص سريع"
            values={[
              { label: "العنوان", value: displayName },
              { label: "الحالة الحالية", value: currentStatus, tone: "status" },
              { label: "عدد الوسائط", value: String(mediaCount) },
              { label: "عدد المستندات", value: String(documentCount) },
            ]}
          />
          {showUploadPreset(entityLabel) ? renderUploadRail(entityLabel, setMediaCount, setDocumentCount) : null}
        </>
      }
    >
      <section className="rounded-[8px] border border-border bg-white p-5">
        <div className="flex flex-col gap-4 border-b border-border pb-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-slate-900">{panelTitle}</h2>
            <p className="text-sm leading-6 text-slate-500">هذه الصفحة تجريبية، لكن تم تنظيمها لتشبه صفحة تشغيل فعلية داخل الإدارة.</p>
          </div>
          <div className="text-xs text-slate-500">يمكنك إدخال البيانات، رفع الملفات محليًا، ثم حفظها داخل الواجهة فقط.</div>
        </div>
        <div className="mt-4">
          <AdminFormActionBar
            submitLabel={submitLabel}
            backHref={backHref}
            showDraftAction={showDraftAction(entityLabel)}
            onSubmit={() => {
              setDraftSaved(false);
              setSaved(true);
            }}
            onSaveDraft={() => {
              setSaved(false);
              setDraftSaved(true);
            }}
          />
        </div>
      </section>

      {sections.map((section) => (
        <AdminFormSection key={section.key} title={section.title} description={section.description}>
          <div className="grid gap-4 md:grid-cols-2">
            {section.fields.map((field) => (
              <AdminFormField
                key={field.name}
                label={field.label}
                helpText={field.helpText}
                className={field.type === "textarea" ? "md:col-span-2" : undefined}
              >
                {field.type === "textarea" ? (
                  <AdminTextarea
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                  />
                ) : field.type === "select" ? (
                  <AdminSelect value={values[field.name] ?? ""} onChange={(event) => updateValue(field.name, event.target.value)}>
                    {(field.options ?? []).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </AdminSelect>
                ) : (
                  <AdminInput
                    type={field.type === "email" || field.type === "number" ? field.type : "text"}
                    placeholder={field.placeholder}
                    value={values[field.name] ?? ""}
                    onChange={(event) => updateValue(field.name, event.target.value)}
                  />
                )}
              </AdminFormField>
            ))}
          </div>
        </AdminFormSection>
      ))}

      {saved ? <div className="rounded-[8px] border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">{completionText}</div> : null}
      {draftSaved ? <div className="rounded-[8px] border border-border bg-slate-50 px-4 py-3 text-sm text-slate-700">تم حفظ {entityLabel} كمسودة داخل الواجهة التجريبية.</div> : null}
    </AdminFormPageLayout>
  );
}

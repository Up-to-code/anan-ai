import Link from "next/link";
import DataTable from "@/components/shared/DataTable";
import EmptyState from "@/components/shared/EmptyState";
import FormField from "@/components/shared/FormField";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { formatDateTime } from "@/lib/format";
import { getComplianceRulesetsPageData, saveComplianceRuleset } from "@/admin_zone/api/compliance";

type ComplianceRulesetsPageProps = {
  searchParams: {
    selected?: string;
  };
};

function stringifyJson(value: unknown, fallback: string) {
  try {
    return JSON.stringify(value ?? JSON.parse(fallback), null, 2);
  } catch {
    return fallback;
  }
}

/**
 * WHY:   Admins need a single workspace surface to manage compliance rulesets.
 * WHAT:  Renders the ruleset editor form alongside the ruleset listing table.
 * HOW:   Fetches rulesets on the server and posts edits through a server action.
 */
export default async function ComplianceRulesetsPage({ searchParams }: ComplianceRulesetsPageProps) {
  const data = await getComplianceRulesetsPageData(searchParams.selected);
  const selectedRuleset = data.selected as Record<string, unknown> | null;

  async function saveAction(formData: FormData) {
    "use server";

    const payload = {
      id: String(formData.get("id") ?? "") || undefined,
      countryCode: String(formData.get("countryCode") ?? "").trim(),
      countryLabel: String(formData.get("countryLabel") ?? "").trim() || undefined,
      orgType: String(formData.get("orgType") ?? "broker"),
      status: String(formData.get("status") ?? "draft"),
      requirements: JSON.parse(String(formData.get("requirements") ?? "[]")),
      sources: JSON.parse(String(formData.get("sources") ?? "[]")),
      enforcement: JSON.parse(String(formData.get("enforcement") ?? "{}")),
    };

    await saveComplianceRuleset(payload);
  }

  const requirementsFallback = "[]";
  const sourcesFallback = "[]";
  const enforcementFallback = JSON.stringify(
    {
      blockPublish: true,
      hideUnverified: true,
      showBanner: true,
      requireOrgVerification: true,
      requireListingVerification: true,
      bannerTitle: "التوثيق مطلوب قبل النشر",
      bannerBody: "يرجى إكمال مستندات التحقق قبل نشر العقارات أو عرضها للعملاء.",
      bannerCtaLabel: "إكمال التوثيق",
      bannerCtaHref: "/ws?onboarding=verification",
    },
    null,
    2,
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
      <WorkspacePanel className="space-y-6">
        <div>
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-blue-600">
            {selectedRuleset ? "تعديل قواعد الامتثال" : "إنشاء قواعد امتثال"}
          </div>
          <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900">
            {selectedRuleset ? String(selectedRuleset.countryLabel ?? selectedRuleset.countryCode ?? "قواعد") : "قواعد جديدة"}
          </h2>
        </div>

        <form action={saveAction} className="space-y-4">
          {selectedRuleset ? <input type="hidden" name="id" value={String(selectedRuleset._id)} /> : null}
          <FormField label="رمز الدولة" htmlFor="countryCode">
            <input
              id="countryCode"
              name="countryCode"
              defaultValue={String(selectedRuleset?.countryCode ?? "SA")}
              className="h-12 w-full border-2 border-slate-100 px-4"
              required
            />
          </FormField>
          <FormField label="اسم الدولة" htmlFor="countryLabel">
            <input
              id="countryLabel"
              name="countryLabel"
              defaultValue={String(selectedRuleset?.countryLabel ?? "المملكة العربية السعودية")}
              className="h-12 w-full border-2 border-slate-100 px-4"
            />
          </FormField>
          <FormField label="نوع الجهة" htmlFor="orgType">
            <select
              id="orgType"
              name="orgType"
              defaultValue={String(selectedRuleset?.orgType ?? "broker")}
              className="h-12 w-full border-2 border-slate-100 px-4"
            >
              <option value="broker">وسيط</option>
              <option value="red">مطور</option>
            </select>
          </FormField>
          <FormField label="الحالة" htmlFor="status">
            <select
              id="status"
              name="status"
              defaultValue={String(selectedRuleset?.status ?? "draft")}
              className="h-12 w-full border-2 border-slate-100 px-4"
            >
              <option value="active">نشط</option>
              <option value="draft">مسودة</option>
              <option value="inactive">غير نشط</option>
            </select>
          </FormField>
          <FormField label="متطلبات التوثيق (JSON)" htmlFor="requirements">
            <textarea
              id="requirements"
              name="requirements"
              defaultValue={stringifyJson(selectedRuleset?.requirements, requirementsFallback)}
              className="min-h-40 w-full border-2 border-slate-100 px-4 py-3 text-xs"
              required
            />
          </FormField>
          <FormField label="المصادر الرسمية (JSON)" htmlFor="sources">
            <textarea
              id="sources"
              name="sources"
              defaultValue={stringifyJson(selectedRuleset?.sources, sourcesFallback)}
              className="min-h-32 w-full border-2 border-slate-100 px-4 py-3 text-xs"
              required
            />
          </FormField>
          <FormField label="سلوك المنع والإشعار (JSON)" htmlFor="enforcement">
            <textarea
              id="enforcement"
              name="enforcement"
              defaultValue={stringifyJson(selectedRuleset?.enforcement, enforcementFallback)}
              className="min-h-40 w-full border-2 border-slate-100 px-4 py-3 text-xs"
              required
            />
          </FormField>

          <div className="flex flex-wrap gap-3">
            <button type="submit" className="h-12 border-2 border-blue-600 bg-blue-600 px-6 text-xs font-black uppercase tracking-[0.22em] text-white">
              {selectedRuleset ? "تحديث" : "إنشاء"}
            </button>
            {selectedRuleset ? (
              <Link
                href="/compliance"
                className="h-12 border-2 border-slate-200 bg-white px-6 leading-[44px] text-xs font-black uppercase tracking-[0.22em] text-slate-700"
              >
                إلغاء
              </Link>
            ) : null}
          </div>
        </form>
      </WorkspacePanel>

      <WorkspacePanel className="space-y-6">
        {data.rulesets.length > 0 ? (
          <DataTable headers={["الدولة", "النوع", "الحالة", "الإصدار", "التاريخ", "تعديل"]}>
            {data.rulesets.map((ruleset) => (
              <tr key={String(ruleset._id)} className="border-b border-slate-100 last:border-b-0">
                <td className="px-4 py-4">
                  <div className="text-sm font-black text-slate-900">{String(ruleset.countryLabel ?? ruleset.countryCode ?? "—")}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{String(ruleset.countryCode ?? "")}</div>
                </td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{String(ruleset.orgType ?? "—")}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{String(ruleset.status ?? "—")}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{String(ruleset.version ?? "—")}</td>
                <td className="px-4 py-4 text-sm font-semibold text-slate-700">{formatDateTime(Number(ruleset.updatedAt ?? ruleset._creationTime ?? 0))}</td>
                <td className="px-4 py-4">
                  <Link href={`/compliance?selected=${encodeURIComponent(String(ruleset._id))}`} className="text-xs font-black uppercase tracking-[0.18em] text-blue-600">
                    تعديل
                  </Link>
                </td>
              </tr>
            ))}
          </DataTable>
        ) : (
          <EmptyState title="لا توجد قواعد" description="ابدأ بإضافة قواعد امتثال جديدة." />
        )}
      </WorkspacePanel>
    </section>
  );
}

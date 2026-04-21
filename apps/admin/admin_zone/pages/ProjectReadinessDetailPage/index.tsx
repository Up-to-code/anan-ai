import EmptyState from "@/components/shared/EmptyState";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getProjectReadinessDetailPageData } from "@/admin_zone/api/projects";
import { projectReadinessDetailTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import {
  submitProjectAdLicenseReviewAction,
  submitProjectAdminBlockAction,
  submitProjectDocumentReviewAction,
  submitProjectRecomputeAction,
  submitProjectWafiReviewedAction,
} from "./actions";

function text(record: Record<string, unknown> | null | undefined, key: string, fallback = "غير متوفر") {
  const raw = record?.[key];
  return typeof raw === "string" && raw.length > 0 ? raw : fallback;
}

function numberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

function records(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? value as Array<Record<string, unknown>> : [];
}

/**
 * WHY:   Saudi project readiness decisions need a single admin review room before public distribution.
 * WHAT:  Shows dossier context, blockers, documents, licenses, authorization, and review controls.
 * HOW:   Loads the Convex admin review detail and submits decisions through server actions.
 */
export default async function ProjectReadinessDetailPage({ dossierId }: { dossierId: string }) {
  const { detail } = await getProjectReadinessDetailPageData(dossierId);
  if (!detail) return <EmptyState title="ملف المشروع غير موجود" description="تعذر العثور على ملف الجاهزية المطلوب." />;

  const dossier = (detail.dossier ?? {}) as Record<string, unknown>;
  const property = (detail.property ?? {}) as Record<string, unknown>;
  const readiness = (detail.readiness ?? {}) as Record<string, unknown>;
  const location = (dossier.location ?? {}) as Record<string, unknown>;
  const documents = records(detail.documents);
  const adLicenses = records(detail.adLicenses);
  const authorizations = records(detail.brokerAuthorizations);
  const units = records(detail.units);
  const paymentPlans = records(detail.paymentPlans);
  const events = records(detail.events);
  const blockers = records(readiness.blockers);
  const warnings = records(readiness.warnings);
  const propertyId = text(property, "_id", "");

  return (
    <SectionScaffold
      eyebrow="امتثال المشاريع"
      title={text(dossier, "title", text(property, "title", "تفاصيل جاهزية المشروع"))}
      description="هذه مراجعة تشغيلية قبل التوزيع العام. لا تعتبر حكماً قانونياً نهائياً."
      tabs={projectReadinessDetailTabs(dossierId)}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.25fr)_380px]">
        <div className="space-y-8">
          <WorkspacePanel className="space-y-5 p-8">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/20 pb-5">
              <StatusBadge value={text(dossier, "readinessStatus", "incomplete")} />
              <StatusBadge value={text(dossier, "requestedVisibility", "private")} />
              <StatusBadge value={text(dossier, "projectType", "ready_property")} />
            </div>
            <KeyValueGrid
              columns={2}
              items={[
                { label: "المدينة", value: text(location, "city") },
                { label: "الحي", value: text(location, "district") },
                { label: "نمط البيع", value: text(dossier, "salesMode") },
                { label: "حالة النشر", value: text(property, "publicationState") },
                { label: "آخر حساب جاهزية", value: formatDateTime(numberValue(dossier.lastReadinessComputedAt)) },
                { label: "مراجعة قانونية", value: "موصى بها قبل الإطلاق الخارجي" },
              ]}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">العوائق والتحذيرات</h2>
            {[...blockers, ...warnings].length > 0 ? (
              <div className="grid gap-3">
                {[...blockers, ...warnings].map((item, index) => (
                  <div key={`${text(item, "code")}-${index}`} className="rounded-lg border border-border bg-muted/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-black text-foreground">{text(item, "label")}</div>
                      <StatusBadge value={text(item, "severity", "medium")} />
                    </div>
                    <p className="mt-2 text-sm font-medium leading-7 text-muted-foreground">{text(item, "nextAction")}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm font-bold text-emerald-700">
                لا توجد عوائق تشغيلية حالياً.
              </div>
            )}
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">الوحدات وخطط الدفع</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {units.map((unit) => (
                <div key={text(unit, "_id")} className="rounded-lg border border-border bg-muted/10 p-4">
                  <div className="text-sm font-black text-foreground">{text(unit, "label")}</div>
                  <div className="mt-2 text-xs font-bold text-muted-foreground">{text(unit, "status")} · {String(unit.price ?? "بدون سعر")}</div>
                </div>
              ))}
              {paymentPlans.map((plan) => (
                <div key={text(plan, "_id")} className="rounded-lg border border-border bg-muted/10 p-4">
                  <div className="text-sm font-black text-foreground">{text(plan, "title")}</div>
                  <div className="mt-2 text-xs font-bold text-muted-foreground">سعر البداية: {String(plan.startingPrice ?? "غير محدد")}</div>
                </div>
              ))}
            </div>
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">المستندات ورخص الإعلان</h2>
            <div className="space-y-4">
              {documents.map((document) => (
                <form key={text(document, "_id")} action={submitProjectDocumentReviewAction} className="rounded-lg border border-border bg-muted/10 p-4">
                  <input type="hidden" name="dossierId" value={dossierId} />
                  <input type="hidden" name="documentId" value={text(document, "_id")} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-foreground">{text(document, "title")}</div>
                      <div className="mt-1 text-xs font-bold text-muted-foreground">{text(document, "documentType")}</div>
                    </div>
                    <StatusBadge value={text(document, "status")} />
                  </div>
                  <textarea name="notes" rows={2} className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="ملاحظات تشغيلية للمراجع" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["in_review", "approved", "rejected", "expired"].map((status) => (
                      <button key={status} name="status" value={status} className="rounded-lg border border-border px-3 py-2 text-xs font-black uppercase tracking-widest">
                        {status}
                      </button>
                    ))}
                  </div>
                </form>
              ))}
              {adLicenses.map((license) => (
                <form key={text(license, "_id")} action={submitProjectAdLicenseReviewAction} className="rounded-lg border border-border bg-muted/10 p-4">
                  <input type="hidden" name="dossierId" value={dossierId} />
                  <input type="hidden" name="adLicenseId" value={text(license, "_id")} />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-black text-foreground">رخصة إعلان {text(license, "licenseNumber")}</div>
                      <div className="mt-1 text-xs font-bold text-muted-foreground">{records(license.channels).join("، ")}</div>
                    </div>
                    <StatusBadge value={text(license, "status")} />
                  </div>
                  <textarea name="notes" rows={2} className="mt-3 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="ملاحظات تشغيلية للمراجع" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {["pending", "approved", "rejected", "expired"].map((status) => (
                      <button key={status} name="status" value={status} className="rounded-lg border border-border px-3 py-2 text-xs font-black uppercase tracking-widest">
                        {status}
                      </button>
                    ))}
                  </div>
                </form>
              ))}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-8">
          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">إجراءات الجاهزية</h2>
            <form action={submitProjectAdminBlockAction} className="space-y-3">
              <input type="hidden" name="dossierId" value={dossierId} />
              <textarea name="reason" rows={3} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="سبب الحجب التشغيلي" />
              <div className="grid gap-2">
                <button name="blocked" value="true" className="rounded-lg bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white">حجب المشروع</button>
                <button name="blocked" value="false" className="rounded-lg border border-border px-4 py-3 text-xs font-black uppercase tracking-widest">إزالة الحجب</button>
              </div>
            </form>
            <form action={submitProjectWafiReviewedAction} className="space-y-3">
              <input type="hidden" name="dossierId" value={dossierId} />
              <textarea name="notes" rows={2} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" placeholder="ملاحظات مراجعة وافي/القانون" />
              <button className="w-full rounded-lg border border-border px-4 py-3 text-xs font-black uppercase tracking-widest">تمييز وافي/القانون كمراجع</button>
            </form>
            <form action={submitProjectRecomputeAction}>
              <input type="hidden" name="dossierId" value={dossierId} />
              <input type="hidden" name="propertyId" value={propertyId} />
              <button className="w-full rounded-lg bg-foreground px-4 py-3 text-xs font-black uppercase tracking-widest text-background">إعادة حساب الجاهزية</button>
            </form>
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">التفويض</h2>
            {authorizations.length > 0 ? authorizations.map((authorization) => (
              <KeyValueGrid
                key={text(authorization, "_id")}
                items={[
                  { label: "رقم العقد", value: text(authorization, "contractNumber") },
                  { label: "النطاق", value: text(authorization, "marketingScope") },
                  { label: "العمولة", value: text(authorization, "commissionTerms") },
                  { label: "الحالة", value: text(authorization, "status") },
                ]}
              />
            )) : <p className="text-sm font-bold text-muted-foreground">لا يوجد تفويض نشط.</p>}
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/50">سجل الجاهزية</h2>
            <div className="space-y-3">
              {events.map((event) => (
                <div key={text(event, "_id")} className="rounded-lg border border-border bg-muted/10 p-3">
                  <div className="text-sm font-black text-foreground">{text(event, "eventType")}</div>
                  <div className="mt-1 text-xs font-bold text-muted-foreground">{formatDateTime(numberValue(event.createdAt))}</div>
                  {typeof event.message === "string" ? <p className="mt-2 text-sm text-muted-foreground">{event.message}</p> : null}
                </div>
              ))}
            </div>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}

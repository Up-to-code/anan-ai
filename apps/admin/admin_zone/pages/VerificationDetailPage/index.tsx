import EmptyState from "@/components/shared/EmptyState";
import Link from "next/link";
import KeyValueGrid from "@/components/shared/KeyValueGrid";
import SectionScaffold from "@/components/shared/SectionScaffold";
import StatusBadge from "@/components/shared/StatusBadge";
import WorkspacePanel from "@/components/shared/WorkspacePanel";
import { getVerificationDetailPageData } from "@/admin_zone/api/verifications";
import { verificationDetailTabs } from "@/lib/adminSectionTabs";
import { formatDateTime } from "@/lib/format";
import { labelForRole, labelForVerificationType } from "@/lib/adminLabels";
import { submitVerificationReviewAction } from "./actions";

function toStringValue(value: unknown, fallback = "غير متوفر") {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function toNumberValue(value: unknown) {
  return typeof value === "number" ? value : null;
}

type VerificationDetailPageProps = {
  requestId: string;
};

/**
 * WHY:   Admin reviewers need one live drill-down page for every verification request before taking approval or close actions.
 * WHAT:  Renders the selected verification request, its subject, evidence, and admin-only review controls.
 * HOW:   Loads the request through the admin verification API and submits status transitions via a server action.
 */
export default async function VerificationDetailPage({ requestId }: VerificationDetailPageProps) {
  const { detail } = await getVerificationDetailPageData(requestId);

  if (!detail) {
    return <EmptyState title="طلب التوثيق غير موجود" description="تعذر العثور على سجل التوثيق المطلوب." />;
  }

  const subject = (detail.subject ?? {}) as Record<string, unknown>;
  const profile = (subject.profile ?? null) as Record<string, unknown> | null;
  const broker = (subject.broker ?? null) as Record<string, unknown> | null;
  const developer = (subject.developer ?? null) as Record<string, unknown> | null;
  const property = (subject.property ?? null) as Record<string, unknown> | null;
  const attachedDocuments = Array.isArray(detail.attachedDocuments) ? detail.attachedDocuments : [];
  const decisionHistory = Array.isArray(detail.decisionHistory) ? detail.decisionHistory : [];
  const relatedOrganizationHref = broker?.id
    ? `/organizations/broker__${toStringValue(broker.id)}`
    : developer?.id
      ? `/organizations/red__${toStringValue(developer.id)}`
      : null;

  return (
    <SectionScaffold
      eyebrow="الامتثال"
      title={toStringValue(detail.title, "تفاصيل طلب التوثيق")}
      description="مراجعة المستندات، فهم سياق الجهة، واتخاذ قرار الاعتماد أو الإغلاق من لوحة الأدمن."
      tabs={verificationDetailTabs(requestId)}
    >
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_380px]">
        <div className="space-y-8">
          <WorkspacePanel className="space-y-6 p-8">
            <div className="flex flex-wrap items-center gap-3 border-b border-border/20 pb-6">
              <StatusBadge value={typeof detail.currentStatus === "string" ? detail.currentStatus : null} />
              <StatusBadge value={typeof detail.requestType === "string" ? detail.requestType : null} />
            </div>
            <KeyValueGrid
              items={[
                { label: "نوع الطلب", value: labelForVerificationType(typeof detail.requestType === "string" ? detail.requestType : null) },
                { label: "تاريخ الإرسال", value: formatDateTime(toNumberValue(detail.submittedAt)) },
                { label: "تاريخ آخر مراجعة", value: formatDateTime(toNumberValue(detail.reviewedAt)) },
                { label: "عدد المستندات", value: attachedDocuments.length },
              ]}
              columns={2}
            />
            {typeof detail.reviewerNotes === "string" && detail.reviewerNotes.length > 0 ? (
              <div className="rounded-2xl border border-border bg-muted/20 p-4">
                <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">ملاحظات المراجع</div>
                <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{detail.reviewerNotes}</p>
              </div>
            ) : null}
          </WorkspacePanel>

          <WorkspacePanel className="space-y-5 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">المستندات المرفقة</h2>
            {attachedDocuments.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {attachedDocuments.map((document) => {
                  const record = document as Record<string, unknown>;
                  return (
                    <a
                      key={toStringValue(record.key, toStringValue(record.url))}
                      href={toStringValue(record.url, "#")}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-2xl border border-border/40 bg-card p-5 transition hover:border-primary/30 hover:bg-muted/10"
                    >
                      <div className="text-sm font-black text-foreground">{toStringValue(record.name, "مستند")}</div>
                      <div className="mt-1 text-xs font-bold text-muted-foreground/60">
                        {toStringValue(record.mime, "مستند")}{" "}
                        {typeof record.size === "number" ? `• ${Math.ceil(record.size / 1024)} KB` : ""}
                      </div>
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/40 bg-muted/5 p-10 text-center text-sm font-bold text-muted-foreground/50">
                لا توجد مستندات مرفقة.
              </div>
            )}
          </WorkspacePanel>

          <WorkspacePanel className="space-y-5 p-8">
            <h2 className="text-xl font-black tracking-tight text-foreground">سجل القرارات</h2>
            <div className="space-y-3">
              {decisionHistory.map((item) => {
                const record = item as Record<string, unknown>;
                return (
                  <div key={toStringValue(record.id)} className="rounded-2xl border border-border/30 bg-card p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-black text-foreground">{toStringValue(record.label)}</div>
                      <StatusBadge value={typeof record.status === "string" ? record.status : null} />
                    </div>
                    <div className="mt-2 text-xs font-bold text-muted-foreground/60">
                      {formatDateTime(toNumberValue(record.createdAt))}
                    </div>
                    {typeof record.notes === "string" && record.notes.length > 0 ? (
                      <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{record.notes}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </WorkspacePanel>
        </div>

        <div className="space-y-8">
          <WorkspacePanel className="space-y-6 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">الجهة المرتبطة</h2>
            <KeyValueGrid
              items={[
                { label: "الملف الشخصي", value: toStringValue(profile?.name) },
                { label: "البريد", value: toStringValue(profile?.email) },
                { label: "دور الحساب", value: labelForRole(typeof profile?.role === "string" ? profile.role : null) },
                {
                  label: "المنظمة",
                  value: relatedOrganizationHref ? (
                    <Link href={relatedOrganizationHref} className="text-primary underline decoration-primary/30 underline-offset-4">
                      {toStringValue(broker?.name ?? developer?.name)}
                    </Link>
                  ) : (
                    toStringValue(broker?.name ?? developer?.name)
                  ),
                },
                { label: "العقار", value: toStringValue(property?.title) },
              ]}
            />
          </WorkspacePanel>

          <WorkspacePanel className="space-y-4 p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground/40">إجراءات الأدمن</h2>
            <form action={submitVerificationReviewAction} className="space-y-4">
              <input type="hidden" name="id" value={requestId} />
              <textarea
                name="reviewerNotes"
                defaultValue={typeof detail.reviewerNotes === "string" ? detail.reviewerNotes : ""}
                rows={5}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition focus-visible:border-ring focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                placeholder="أضف ملاحظات للمراجعة أو سبب الإغلاق/الرفض..."
              />
              <div className="grid gap-3">
                <button type="submit" name="status" value="in_review" className="rounded-full border border-border bg-background px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-foreground transition hover:bg-muted/20">
                  تحويل إلى قيد المراجعة
                </button>
                <button type="submit" name="status" value="approved" className="rounded-full bg-emerald-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-emerald-500">
                  اعتماد المنظمة
                </button>
                <button type="submit" name="status" value="rejected" className="rounded-full bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-red-500">
                  رفض الطلب
                </button>
                <button type="submit" name="status" value="closed" className="rounded-full bg-foreground px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-background transition hover:bg-foreground/90">
                  إغلاق التوثيق
                </button>
              </div>
              <p className="text-xs font-medium leading-relaxed text-muted-foreground">
                اعتماد الطلب يفعّل المنظمة، بينما إغلاق التوثيق يعيدها إلى حالة غير موثقة ويعيد تطبيق قيود النشر.
              </p>
            </form>
          </WorkspacePanel>
        </div>
      </div>
    </SectionScaffold>
  );
}

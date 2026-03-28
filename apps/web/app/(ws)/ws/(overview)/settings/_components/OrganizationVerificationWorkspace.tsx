"use client";

import { useMemo, useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import type {
  OrganizationSummary,
  OrganizationVerificationSummary,
} from "@/server/contracts/organizations";
import type { ComplianceRuleset } from "@/server/contracts/compliance";
import type { UploadedFileReference } from "@/server/contracts/files";
import {
  DocumentsCard,
  postVerificationRequest,
  RequirementsChecklist,
} from "../../../_components/OrganizationOnboarding/VerificationDocsStep.parts";
import { filterRequirements } from "../../../_components/OrganizationOnboarding/requirements";

type OrganizationVerificationWorkspaceProps = {
  organization: OrganizationSummary | null;
  verificationSummary?: OrganizationVerificationSummary;
  ruleset: ComplianceRuleset | null;
  canManage: boolean;
  membersCount: number;
  invitesCount: number;
  roleLabel: string;
};

const emptyVerificationSummary: OrganizationVerificationSummary = {
  isVerified: false,
  currentRequestId: null,
  currentRequestStatus: "not_submitted",
  lastSubmittedAt: null,
  lastReviewedAt: null,
  reviewerNotes: null,
  documentsCount: 0,
  publishingBlocked: false,
  attachedDocuments: [],
  requirements: [],
  sourceUrls: [],
};

function formatDateLabel(value: number | null) {
  if (!value) return "غير متوفر";
  return new Date(value).toLocaleString("ar-EG");
}

function verificationStatusLabel(status: OrganizationVerificationSummary["currentRequestStatus"]) {
  if (status === "approved") return "معتمد";
  if (status === "in_review") return "قيد المراجعة";
  if (status === "rejected") return "مرفوض";
  if (status === "closed") return "مغلق";
  if (status === "new") return "تم الإرسال";
  return "لم يتم الإرسال";
}

function verificationStatusTone(status: OrganizationVerificationSummary["currentRequestStatus"]) {
  if (status === "approved") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (status === "in_review") return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "rejected") return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";
  if (status === "closed") return "border-border bg-muted text-muted-foreground";
  if (status === "new") return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  return "border-border bg-muted/50 text-muted-foreground";
}

function buildTimeline(summary: OrganizationVerificationSummary) {
  const items: Array<{ id: string; label: string; at: number; note?: string | null }> = [];
  if (summary.lastSubmittedAt) {
    items.push({
      id: "submitted",
      label: "تم إرسال الطلب",
      at: summary.lastSubmittedAt,
    });
  }
  if (summary.currentRequestStatus === "in_review" && summary.lastSubmittedAt) {
    items.push({
      id: "in_review",
      label: "الطلب قيد المراجعة",
      at: summary.lastSubmittedAt,
    });
  }
  if (summary.lastReviewedAt) {
    items.push({
      id: "reviewed",
      label:
        summary.currentRequestStatus === "approved"
          ? "تم اعتماد المنظمة"
          : summary.currentRequestStatus === "closed"
            ? "تم إغلاق التوثيق"
            : summary.currentRequestStatus === "rejected"
              ? "تم رفض الطلب"
              : "تم تحديث حالة التوثيق",
      at: summary.lastReviewedAt,
      note: summary.reviewerNotes,
    });
  }
  return items.sort((left, right) => right.at - left.at);
}

async function uploadVerificationDocuments(args: {
  files: File[];
  startUpload: ReturnType<typeof useUploadThing>["startUpload"];
  setError: (value: string | null) => void;
  setDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
}) {
  if (args.files.length === 0) return;
  args.setError(null);
  try {
    const uploaded = await args.startUpload(args.files);
    const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
    args.setDocs((current) => [...current, ...nextDocs]);
  } catch (error) {
    args.setError(error instanceof Error ? error.message : "تعذر رفع الملفات.");
  }
}

/**
 * WHY:   Workspace settings need one organization-wide verification center instead of hiding verification inside onboarding only.
 * WHAT:  Renders the current organization verification status, evidence timeline, and manager-only resubmission form.
 * HOW:   Uses the shared verification checklist/upload widgets, keeps approval actions out of workspace, and mirrors local submission state after successful posts.
 */
export default function OrganizationVerificationWorkspace({
  organization,
  verificationSummary = emptyVerificationSummary,
  ruleset,
  canManage,
  membersCount,
  invitesCount,
  roleLabel,
}: OrganizationVerificationWorkspaceProps) {
  const [summary, setSummary] = useState(verificationSummary);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>(
    Object.fromEntries(verificationSummary.requirements.map((entry) => [entry, true])),
  );
  const [requiredDocs, setRequiredDocs] = useState<UploadedFileReference[]>([]);
  const [proofDocs, setProofDocs] = useState<UploadedFileReference[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requiredInputRef = useRef<HTMLInputElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("verificationDocuments");

  const filteredRequirements = useMemo(
    () => filterRequirements(ruleset?.requirements ?? [], query),
    [query, ruleset?.requirements],
  );
  const timeline = buildTimeline(summary);
  const organizationTypeLabel = organization?.type === "red" ? "مطور عقاري" : "وسيط عقاري";

  if (!organization) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <h2 className="text-lg font-bold text-foreground">توثيق المنظمة</h2>
        <p className="mt-2 text-sm text-muted-foreground">لا توجد منظمة مرتبطة بالحساب الحالي.</p>
      </section>
    );
  }

  return (
    <section className="space-y-6 pb-12" dir="rtl">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">توثيق المنظمة</h2>
              <p className="text-sm font-medium text-muted-foreground">
                هذا التوثيق يخص المنظمة كاملة. يمكن للمدير إرسال أو إعادة إرسال المستندات، بينما يعتمد الأدمن فقط الطلب أو يغلقه.
              </p>
            </div>
            <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${verificationStatusTone(summary.currentRequestStatus)}`}>
              {verificationStatusLabel(summary.currentRequestStatus)}
            </span>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">حالة النشر</div>
              <div className="mt-2 text-sm font-bold text-foreground">
                {summary.publishingBlocked ? "النشر متوقف حتى اعتماد التوثيق" : "لا يوجد حظر نشر من توثيق المنظمة"}
              </div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">آخر إرسال</div>
              <div className="mt-2 text-sm font-bold text-foreground">{formatDateLabel(summary.lastSubmittedAt)}</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">عدد الملفات</div>
              <div className="mt-2 text-sm font-bold text-foreground">{summary.documentsCount} ملف</div>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">ملخص الفريق</div>
              <div className="mt-2 text-sm font-bold text-foreground">
                {membersCount} أعضاء، {invitesCount} دعوات، وصلاحيتك الحالية: {roleLabel}
              </div>
            </div>
          </div>

          {summary.reviewerNotes ? (
            <div className="mt-4 rounded-2xl border border-border bg-muted/30 p-4">
              <div className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">ملاحظات المراجعة</div>
              <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{summary.reviewerNotes}</p>
            </div>
          ) : null}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">الخط الزمني</h3>
          <div className="mt-4 space-y-3">
            {timeline.length > 0 ? (
              timeline.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border bg-background p-4">
                  <div className="text-sm font-bold text-foreground">{item.label}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">{formatDateLabel(item.at)}</div>
                  {item.note ? <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{item.note}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-sm font-medium text-muted-foreground">
                لا يوجد طلب توثيق مرسل حتى الآن.
              </div>
            )}
          </div>
        </div>
      </div>

      {summary.attachedDocuments.length > 0 ? (
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground">المستندات المرفوعة في آخر طلب</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.attachedDocuments.map((document) => (
              <a
                key={document.key}
                href={document.url}
                target="_blank"
                rel="noreferrer"
                className="rounded-2xl border border-border bg-background p-4 transition hover:border-ring/40 hover:bg-muted/20"
              >
                <div className="text-sm font-bold text-foreground">{document.name}</div>
                <div className="mt-1 text-xs font-medium text-muted-foreground">
                  {document.mime ?? "مستند"}{document.size ? ` • ${Math.ceil(document.size / 1024)} KB` : ""}
                </div>
              </a>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-4 rounded-3xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">إرسال أو إعادة إرسال مستندات التوثيق</h3>
          <p className="text-sm font-medium text-muted-foreground">
            نوع الجهة الحالي: {organizationTypeLabel}. يمكن للمدير فقط استخدام هذا النموذج، بينما تظهر قرارات المراجعة من لوحة الأدمن.
          </p>
        </div>

        <RequirementsChecklist
          countryLabel={ruleset?.countryLabel ?? null}
          typeLabel={organizationTypeLabel}
          query={query}
          onQueryChange={setQuery}
          selected={selected}
          filteredRequirements={filteredRequirements}
          onToggleRequirement={(id) => setSelected((current) => ({ ...current, [id]: !current[id] }))}
          sources={ruleset?.sources ?? []}
        />

        <div className="grid gap-6 xl:grid-cols-2">
          <DocumentsCard
            title="المستندات الأساسية"
            subtitle="ملفات الهوية والسجلات النظامية الأساسية."
            uploadingLabel="جارٍ رفع الملفات..."
            idleLabel="رفع ملفات PDF أو صور"
            docs={requiredDocs}
            isUploading={isUploading}
            onRemoveDoc={(docKey) => setRequiredDocs((current) => current.filter((item) => item.key !== docKey))}
            inputRef={requiredInputRef}
            onFilesChange={async (event) => {
              await uploadVerificationDocuments({
                files: Array.from(event.target.files ?? []),
                startUpload,
                setError: setErrorMessage,
                setDocs: setRequiredDocs,
              });
              event.target.value = "";
            }}
          />
          <DocumentsCard
            title="إثبات العمل (اختياري)"
            subtitle="نماذج أعمال أو مستندات داعمة لنشاط المنظمة."
            uploadingLabel="جارٍ رفع الملفات..."
            idleLabel="أضف مستندات داعمة"
            docs={proofDocs}
            isUploading={isUploading}
            onRemoveDoc={(docKey) => setProofDocs((current) => current.filter((item) => item.key !== docKey))}
            inputRef={proofInputRef}
            onFilesChange={async (event) => {
              await uploadVerificationDocuments({
                files: Array.from(event.target.files ?? []),
                startUpload,
                setError: setErrorMessage,
                setDocs: setProofDocs,
              });
              event.target.value = "";
            }}
          />
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}
        {statusMessage ? (
          <div className="rounded-2xl border border-border bg-muted/30 p-4 text-sm font-bold text-foreground">
            {statusMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <p className="text-xs font-medium text-muted-foreground">
            {canManage
              ? "بعد الإرسال سيظهر الطلب في لوحة الأدمن للمراجعة. لا توجد أي أزرار اعتماد أو إغلاق هنا."
              : "العرض هنا للمتابعة فقط. تحتاج صلاحية مدير لإرسال أو إعادة إرسال المستندات."}
          </p>
          <button
            type="button"
            disabled={!canManage || isSubmitting || isUploading}
            onClick={async () => {
              if (requiredDocs.length === 0) {
                setErrorMessage("الرجاء رفع مستند واحد على الأقل من المستندات الأساسية.");
                return;
              }
              setErrorMessage(null);
              setStatusMessage("جاري إرسال طلب التوثيق...");
              setIsSubmitting(true);
              try {
                await postVerificationRequest({
                  requiredDocs,
                  proofDocs,
                  selected,
                  sources: ruleset?.sources ?? [],
                  organizationType: organization.type,
                });
                const now = Date.now();
                const allDocs = [...requiredDocs, ...proofDocs];
                setSummary({
                  isVerified: false,
                  currentRequestId: summary.currentRequestId,
                  currentRequestStatus: "new",
                  lastSubmittedAt: now,
                  lastReviewedAt: null,
                  reviewerNotes: null,
                  documentsCount: allDocs.length,
                  publishingBlocked: true,
                  attachedDocuments: allDocs,
                  requirements: Object.keys(selected).filter((key) => selected[key]),
                  sourceUrls: (ruleset?.sources ?? []).map((source) => source.url),
                });
                setStatusMessage("تم إرسال طلب التوثيق بنجاح. سيتم مراجعته من لوحة الأدمن.");
                setRequiredDocs([]);
                setProofDocs([]);
              } catch (error) {
                setStatusMessage(null);
                setErrorMessage(error instanceof Error ? error.message : "تعذر إرسال طلب التوثيق.");
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-full bg-foreground px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "جارٍ الإرسال..." : summary.currentRequestStatus === "not_submitted" ? "إرسال الطلب" : "إعادة إرسال المستندات"}
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
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
import { formatLocaleDateTime } from "@/lib/locale";
import { formatWebCopy } from "@/lib/i18n";
import { useWebLocale } from "@/app/_components/WebLocaleProvider";

type OrganizationVerificationWorkspaceProps = {
  organization: OrganizationSummary | null;
  verificationSummary?: OrganizationVerificationSummary;
  ruleset: ComplianceRuleset | null;
  canManage: boolean;
  membersCount: number;
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

function verificationStatusLabel(
  status: OrganizationVerificationSummary["currentRequestStatus"],
  locale: "ar" | "en" | "fr",
) {
  if (locale === "ar") {
    if (status === "approved") return "معتمد";
    if (status === "in_review") return "قيد المراجعة";
    if (status === "rejected") return "مرفوض";
    if (status === "closed") return "مغلق";
    if (status === "new") return "تم الإرسال";
    return "لم يتم الإرسال";
  }
  if (locale === "fr") {
    if (status === "approved") return "Approuvé";
    if (status === "in_review") return "En révision";
    if (status === "rejected") return "Refusé";
    if (status === "closed") return "Clôturé";
    if (status === "new") return "Envoyé";
    return "Non envoyé";
  }
  if (status === "approved") return "Approved";
  if (status === "in_review") return "In review";
  if (status === "rejected") return "Rejected";
  if (status === "closed") return "Closed";
  if (status === "new") return "Submitted";
  return "Not submitted";
}

function verificationStatusTone(status: OrganizationVerificationSummary["currentRequestStatus"]) {
  if (status === "approved") return "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300";
  if (status === "in_review") return "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300";
  if (status === "rejected") return "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300";
  if (status === "closed") return "border-border bg-muted text-muted-foreground";
  if (status === "new") return "border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300";
  return "border-border bg-muted/50 text-muted-foreground";
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="rounded-[18px] bg-background/65 px-4 py-3">
      <div className="text-[11px] font-semibold text-muted-foreground">{label}</div>
      <div className="mt-2 text-sm font-bold text-foreground">{value}</div>
    </div>
  );
}

function buildLocalizedTimeline(summary: OrganizationVerificationSummary, locale: "ar" | "en" | "fr") {
  const copy =
    locale === "fr"
      ? {
          submitted: "Demande envoyée",
          inReview: "Demande en cours de révision",
          approved: "Organisation approuvée",
          closed: "Vérification clôturée",
          rejected: "Demande refusée",
          updated: "Statut de vérification mis à jour",
        }
      : locale === "en"
        ? {
            submitted: "Request submitted",
            inReview: "Request under review",
            approved: "Organization approved",
            closed: "Verification closed",
            rejected: "Request rejected",
            updated: "Verification status updated",
          }
        : {
            submitted: "تم إرسال الطلب",
            inReview: "الطلب قيد المراجعة",
            approved: "تم اعتماد المنظمة",
            closed: "تم إغلاق التوثيق",
            rejected: "تم رفض الطلب",
            updated: "تم تحديث حالة التوثيق",
          };

  const items: Array<{ id: string; label: string; at: number; note?: string | null }> = [];
  if (summary.lastSubmittedAt) {
    items.push({ id: "submitted", label: copy.submitted, at: summary.lastSubmittedAt });
  }
  if (summary.currentRequestStatus === "in_review" && summary.lastSubmittedAt) {
    items.push({ id: "in_review", label: copy.inReview, at: summary.lastSubmittedAt });
  }
  if (summary.lastReviewedAt) {
    items.push({
      id: "reviewed",
      label:
        summary.currentRequestStatus === "approved"
          ? copy.approved
          : summary.currentRequestStatus === "closed"
            ? copy.closed
            : summary.currentRequestStatus === "rejected"
              ? copy.rejected
              : copy.updated,
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
    args.setError(error instanceof Error ? error.message : "Upload failed.");
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
}: OrganizationVerificationWorkspaceProps) {
  const { locale, dictionary, direction } = useWebLocale();
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
  const timeline = buildLocalizedTimeline(summary, locale);
  const organizationTypeLabel =
    organization?.type === "red"
      ? locale === "fr"
        ? "Promoteur immobilier"
        : locale === "en"
          ? "Real estate developer"
          : "مطور عقاري"
      : locale === "fr"
        ? "Courtier immobilier"
        : locale === "en"
          ? "Real estate broker"
          : "وسيط عقاري";
  const formatDateLabel = (value: number | null) =>
    value ? formatLocaleDateTime(locale, value, { dateStyle: "medium", timeStyle: "short" }) : dictionary.settings.unavailable;

  if (!organization) {
    return (
      <section className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
        <h2 className="text-lg font-bold text-foreground">{dictionary.settings.verificationTitle}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{dictionary.settings.verificationEmptyOrganization}</p>
      </section>
    );
  }

  return (
    <section className="space-y-5 pb-12" dir={direction}>
      <div className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground">{dictionary.settings.verificationCurrentStatus}</div>
            <h2 className="text-lg font-bold text-foreground">{dictionary.settings.verificationTitle}</h2>
            <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
              {formatWebCopy(dictionary.settings.verificationSubmitDescription, { organizationType: organizationTypeLabel })}
            </p>
          </div>
          <span className={`rounded-full border px-3 py-1 text-[11px] font-black ${verificationStatusTone(summary.currentRequestStatus)}`}>
            {verificationStatusLabel(summary.currentRequestStatus, locale)}
          </span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            label={dictionary.settings.publishingStatus}
            value={summary.publishingBlocked ? dictionary.settings.publishingBlocked : dictionary.settings.publishingAllowed}
          />
          <SummaryCard
            label={dictionary.settings.lastSubmission}
            value={formatDateLabel(summary.lastSubmittedAt)}
          />
          <SummaryCard
            label={dictionary.settings.filesCount}
            value={summary.documentsCount}
          />
          <SummaryCard
            label={dictionary.settings.membersCountLabel}
            value={membersCount}
          />
        </div>

        {summary.reviewerNotes ? (
          <div className="mt-4 rounded-[18px] bg-background/65 p-4">
            <div className="text-[11px] font-semibold text-muted-foreground">{dictionary.settings.reviewNotes}</div>
            <p className="mt-2 text-sm font-medium leading-relaxed text-foreground">{summary.reviewerNotes}</p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <div className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
          <h3 className="text-sm font-bold text-foreground">{dictionary.settings.verificationTimeline}</h3>
          <div className="mt-4 space-y-3">
            {timeline.length > 0 ? (
              timeline.map((item) => (
                <div key={item.id} className="rounded-[18px] bg-background/65 p-4">
                  <div className="text-sm font-bold text-foreground">{item.label}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">{formatDateLabel(item.at)}</div>
                  {item.note ? <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">{item.note}</p> : null}
                </div>
              ))
            ) : (
              <div className="rounded-[18px] bg-background/65 p-5 text-sm font-medium text-muted-foreground">
                {dictionary.settings.verificationNoTimeline}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
          <h3 className="text-sm font-bold text-foreground">{dictionary.settings.latestDocuments}</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {summary.attachedDocuments.length > 0 ? (
              summary.attachedDocuments.map((document) => (
                <a
                  key={document.key}
                  href={document.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[18px] bg-background/65 p-4 transition hover:bg-background/85"
                >
                  <div className="text-sm font-bold text-foreground">{document.name}</div>
                  <div className="mt-1 text-xs font-medium text-muted-foreground">
                    {document.mime ?? dictionary.settings.unknownDocumentType}{document.size ? ` • ${Math.ceil(document.size / 1024)} KB` : ""}
                  </div>
                </a>
              ))
            ) : (
              <div className="rounded-[18px] bg-background/65 p-5 text-sm font-medium text-muted-foreground md:col-span-2">
                {dictionary.settings.verificationNoTimeline}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-[24px] bg-[var(--workspace-panel)] p-5 sm:p-6">
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">{dictionary.settings.verificationSubmitTitle}</h3>
          <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">
            {formatWebCopy(dictionary.settings.verificationSubmitDescription, { organizationType: organizationTypeLabel })}
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
            title={dictionary.settings.requiredDocsTitle}
            subtitle={dictionary.settings.requiredDocsSubtitle}
            uploadingLabel={dictionary.settings.uploadingFiles}
            idleLabel={dictionary.settings.uploadFilesIdle}
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
            title={dictionary.settings.proofDocsTitle}
            subtitle={dictionary.settings.proofDocsSubtitle}
            uploadingLabel={dictionary.settings.uploadingFiles}
            idleLabel={dictionary.settings.uploadProofIdle}
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
          <div className="rounded-[18px] bg-red-500/10 p-4 text-sm font-bold text-red-700 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}
        {statusMessage ? (
          <div className="rounded-[18px] bg-background/65 p-4 text-sm font-bold text-foreground">
            {statusMessage}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <p className="text-xs font-medium text-muted-foreground">
            {canManage
              ? dictionary.settings.managerOnlySubmissionHint
              : dictionary.settings.viewerSubmissionHint}
          </p>
          <button
            type="button"
            disabled={!canManage || isSubmitting || isUploading}
            onClick={async () => {
              if (requiredDocs.length === 0) {
                setErrorMessage(dictionary.settings.verificationRequiredDocsError);
                return;
              }
              setErrorMessage(null);
              setStatusMessage(dictionary.settings.verificationSubmitting);
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
                setStatusMessage(dictionary.settings.verificationSubmitted);
                setRequiredDocs([]);
                setProofDocs([]);
              } catch (error) {
                setStatusMessage(null);
                setErrorMessage(error instanceof Error ? error.message : dictionary.settings.verificationSubmitFailed);
              } finally {
                setIsSubmitting(false);
              }
            }}
            className="rounded-[18px] bg-[var(--workspace-highlight)] px-5 py-3 text-[13px] font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? dictionary.settings.verificationSubmitting
              : summary.currentRequestStatus === "not_submitted"
                ? dictionary.settings.verificationSubmit
                : dictionary.settings.verificationResubmit}
          </button>
        </div>
      </div>
    </section>
  );
}

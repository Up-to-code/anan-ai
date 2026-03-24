"use client";

import { Upload } from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { RequirementItem, RequirementSourceLink } from "./requirements";

type RequirementsChecklistProps = {
  countryLabel?: string | null;
  typeLabel: string;
  query: string;
  onQueryChange: (value: string) => void;
  selected: Record<string, boolean>;
  filteredRequirements: RequirementItem[];
  onToggleRequirement: (id: string) => void;
  sources: RequirementSourceLink[];
};

function RequirementBadge({ required }: { required: boolean }) {
  return (
    <span
      className={`border-2 px-2 py-0.5 text-[10px] font-black ${
        required ? "border-amber-200 bg-amber-50 text-amber-800" : "border-slate-100 bg-white text-slate-500"
      }`}
    >
      {required ? "أساسي" : "اختياري"}
    </span>
  );
}

function RequirementItemsList(args: {
  selected: Record<string, boolean>;
  filteredRequirements: RequirementItem[];
  onToggleRequirement: (id: string) => void;
}) {
  if (args.filteredRequirements.length === 0) {
    return <div className="border-2 border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">لا توجد نتائج مطابقة.</div>;
  }
  return args.filteredRequirements.map((item) => (
    <label key={item.id} className="flex items-start gap-3 border-2 border-slate-100 bg-white px-3 py-3 text-sm text-slate-800">
      <input type="checkbox" checked={Boolean(args.selected[item.id])} onChange={() => args.onToggleRequirement(item.id)} className="mt-1" />
      <span className="space-y-1">
        <span className="flex flex-wrap items-center gap-2 font-bold text-slate-900">{item.label}<RequirementBadge required={item.required} /></span>
        {item.note ? <span className="block text-xs text-slate-500">{item.note}</span> : null}
      </span>
    </label>
  ));
}

function RequirementSources({ sources }: Pick<RequirementsChecklistProps, "sources">) {
  return (
    <div className="text-xs text-slate-500">المصادر الرسمية:
      <span className="ml-2 inline-flex flex-wrap gap-2">
        {sources.map((source) => <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="text-slate-700 underline underline-offset-2">{source.label}</a>)}
      </span>
    </div>
  );
}

export function RequirementsChecklist({
  countryLabel,
  typeLabel,
  query,
  onQueryChange,
  selected,
  filteredRequirements,
  onToggleRequirement,
  sources,
}: RequirementsChecklistProps) {
  return (
    <div className="space-y-4 border-2 border-slate-100 bg-white p-5">
      <div className="space-y-1">
        <div className="text-sm font-black text-slate-900">مرجع المتطلبات {countryLabel ?? "للامتثال"}</div>
        <div className="text-xs text-slate-500">القائمة الحالية: {typeLabel}</div>
      </div>
      <input
        type="search"
        placeholder="ابحث عن مستند أو متطلب..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        className="w-full border-2 border-slate-100 bg-white px-3 py-2 text-sm text-slate-900"
      />
      <div className="grid gap-3"><RequirementItemsList selected={selected} filteredRequirements={filteredRequirements} onToggleRequirement={onToggleRequirement} /></div>
      <RequirementSources sources={sources} />
    </div>
  );
}

type DocumentsCardProps = {
  title: string;
  subtitle: string;
  uploadingLabel: string;
  idleLabel: string;
  docs: UploadedFileReference[];
  isUploading: boolean;
  onRemoveDoc: (docKey: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onFilesChange: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
};

export function DocumentsCard({
  title,
  subtitle,
  uploadingLabel,
  idleLabel,
  docs,
  isUploading,
  onRemoveDoc,
  inputRef,
  onFilesChange,
}: DocumentsCardProps) {
  return (
    <div className="space-y-4 border-2 border-slate-100 bg-white p-4">
      <div className="space-y-1">
        <div className="text-sm font-black text-slate-900">{title}</div>
        <div className="text-xs text-slate-500">{subtitle}</div>
      </div>
      <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => void onFilesChange(event)} />
      <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-100 bg-white px-4 py-6 text-sm font-bold text-slate-700">
        <Upload className="h-4 w-4" />
        {isUploading ? uploadingLabel : idleLabel}
      </button>
      <div className="grid gap-2">
        {docs.map((doc) => (
          <div key={doc.key} className="flex items-center justify-between border-2 border-slate-100 bg-white px-3 py-2 text-xs text-slate-700">
            <span className="truncate">{doc.name}</span>
            <button type="button" onClick={() => onRemoveDoc(doc.key)} className="text-xs text-slate-500 hover:text-slate-800">
              إزالة
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

type StepActionsProps = {
  isSubmitting: boolean;
  onBack: () => void;
  onSkip: () => void;
  onSubmit: () => void;
};

export function StepActions({ isSubmitting, onBack, onSkip, onSubmit }: StepActionsProps) {
  return (
    <div className="flex items-center justify-between">
      <button type="button" onClick={onBack} className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50">
        رجوع
      </button>
      <div className="flex items-center gap-3">
        <button type="button" onClick={onSkip} className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50">
          تخطي الآن
        </button>
        <button type="button" onClick={onSubmit} disabled={isSubmitting} className="border-2 border-blue-600 bg-blue-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:opacity-60">
          {isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
        </button>
      </div>
    </div>
  );
}

export async function postVerificationRequest(args: {
  requiredDocs: UploadedFileReference[];
  proofDocs: UploadedFileReference[];
  selected: Record<string, boolean>;
  sources: RequirementSourceLink[];
  organizationType: "broker" | "red";
}) {
  const response = await fetch("/api/verification-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      documents: args.requiredDocs,
      proofDocuments: args.proofDocs,
      requirements: Object.keys(args.selected).filter((key) => args.selected[key]),
      sourceUrls: args.sources.map((source) => source.url),
      organizationType: args.organizationType,
    }),
  });
  if (response.ok) return;
  const payload = await response.json().catch(() => null);
  throw new Error(payload?.message ?? "تعذر إرسال الطلب.");
}

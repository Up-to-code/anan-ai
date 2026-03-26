"use client";

import { Upload, Search, X, Check } from "lucide-react";
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
      className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
        required 
          ? "bg-amber-100 text-amber-900 border border-amber-200/50" 
          : "bg-slate-100 text-slate-500 border border-slate-200/50"
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
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-400 text-center">
        لا توجد نتائج مطابقة.
      </div>
    );
  }
  
  return args.filteredRequirements.map((item) => {
    const isChecked = Boolean(args.selected[item.id]);
    return (
      <button 
        key={item.id} 
        type="button"
        onClick={() => args.onToggleRequirement(item.id)}
        className={`flex items-start gap-4 rounded-2xl border-2 p-4 text-right transition-all ${
          isChecked 
            ? "border-slate-900 bg-white" 
            : "border-slate-50 bg-slate-50/50 hover:bg-white"
        }`}
      >
        <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          isChecked ? "border-slate-900 bg-slate-900" : "border-slate-200 bg-white"
        }`}>
          {isChecked && <Check size={12} color="white" strokeWidth={4} />}
        </div>
        <span className="space-y-1.5 flex-1">
          <span className="flex flex-wrap items-center gap-3 text-[15px] font-black text-slate-900">
            {item.label}
            <RequirementBadge required={item.required} />
          </span>
          {item.note ? <span className="block text-[13px] font-medium text-slate-500 leading-relaxed">{item.note}</span> : null}
        </span>
      </button>
    );
  });
}

function RequirementSources({ sources }: Pick<RequirementsChecklistProps, "sources">) {
  return (
    <div className="text-[13px] font-medium text-slate-400">
      المصادر الرسمية:
      <span className="mr-3 inline-flex flex-wrap gap-4">
        {sources.map((source) => (
          <a 
            key={source.id} 
            href={source.url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-slate-600 font-bold underline decoration-slate-200 underline-offset-4 hover:text-slate-900 hover:decoration-slate-400 transition"
          >
            {source.label}
          </a>
        ))}
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
    <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-1.5 text-right">
        <div className="text-sm font-black uppercase tracking-widest text-slate-900">
          مرجع المتطلبات {countryLabel ?? "للامتثال"}
        </div>
        <div className="text-[13px] font-bold text-slate-400 uppercase">القائمة الحالية: {typeLabel}</div>
      </div>
      
      <div className="relative">
        <input
          type="search"
          placeholder="ابحث عن مستند أو متطلب..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full rounded-full border border-slate-100 bg-slate-50 px-12 py-3.5 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-slate-200 focus:bg-white"
        />
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      <div className="grid gap-3">
        <RequirementItemsList 
          selected={selected} 
          filteredRequirements={filteredRequirements} 
          onToggleRequirement={onToggleRequirement} 
        />
      </div>

      <div className="pt-2">
        <RequirementSources sources={sources} />
      </div>
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
    <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
      <div className="space-y-1.5 text-right">
        <div className="text-[15px] font-black tracking-tight text-slate-900">{title}</div>
        <div className="text-[13px] font-medium text-slate-500">{subtitle}</div>
      </div>

      <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => void onFilesChange(event)} />
      
      <button 
        type="button" 
        onClick={() => inputRef.current?.click()} 
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 px-4 py-8 text-sm font-bold text-slate-600 transition hover:border-slate-200 hover:bg-slate-50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500">
           <Upload size={18} />
        </div>
        {isUploading ? uploadingLabel : idleLabel}
      </button>

      <div className="grid gap-2">
        {docs.map((doc) => (
          <div key={doc.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white pl-3 pr-4 py-2.5 text-[13px] font-medium text-slate-700 group hover:border-slate-200 transition">
            <span className="truncate max-w-[200px]">{doc.name}</span>
            <button 
              type="button" 
              onClick={() => onRemoveDoc(doc.key)} 
              className="rounded-lg px-2.5 py-1 text-[11px] font-black uppercase text-slate-400 hover:bg-red-50 hover:text-red-600 transition"
            >
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
    <div className="flex items-center justify-between pt-6">
      <button 
        type="button" 
        onClick={onBack} 
        className="rounded-full bg-slate-100 px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 transition hover:bg-slate-200"
      >
        رجوع
      </button>
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          onClick={onSkip} 
          className="rounded-full border border-slate-200 bg-white px-8 py-3.5 text-xs font-black uppercase tracking-widest text-slate-500 transition hover:bg-slate-50"
        >
          تخطي الآن
        </button>
        <button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSubmitting} 
          className="rounded-full bg-slate-900 px-10 py-3.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 disabled:opacity-50 shadow-sm"
        >
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

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
          ? "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300" 
          : "border border-border bg-muted text-muted-foreground"
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
      <div className="rounded-2xl border border-border bg-muted/30 px-5 py-4 text-center text-sm font-medium text-muted-foreground">
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
            ? "border-foreground bg-card shadow-sm" 
            : "border-border bg-background hover:bg-muted/20"
        }`}
      >
        <div className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 ${
          isChecked ? "border-foreground bg-foreground" : "border-border bg-background"
        }`}>
          {isChecked && <Check size={12} color="white" strokeWidth={4} />}
        </div>
        <span className="space-y-1.5 flex-1">
          <span className="flex flex-wrap items-center gap-3 text-[15px] font-black text-foreground">
            {item.label}
            <RequirementBadge required={item.required} />
          </span>
          {item.note ? <span className="block text-[13px] font-medium leading-relaxed text-muted-foreground">{item.note}</span> : null}
        </span>
      </button>
    );
  });
}

function RequirementSources({ sources }: Pick<RequirementsChecklistProps, "sources">) {
  return (
    <div className="text-[13px] font-medium text-muted-foreground">
      المصادر الرسمية:
      <span className="mr-3 inline-flex flex-wrap gap-4">
        {sources.map((source) => (
          <a 
            key={source.id} 
            href={source.url} 
            target="_blank" 
            rel="noreferrer" 
            className="font-bold text-foreground underline decoration-border underline-offset-4 transition hover:text-primary hover:decoration-primary/40"
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
    <div className="space-y-6 rounded-[32px] border border-border bg-card p-8 shadow-sm">
      <div className="space-y-1.5 text-right">
        <div className="text-sm font-black uppercase tracking-widest text-foreground">
          مرجع المتطلبات {countryLabel ?? "للامتثال"}
        </div>
        <div className="text-[13px] font-bold uppercase text-muted-foreground">القائمة الحالية: {typeLabel}</div>
      </div>
      
      <div className="relative">
        <input
          type="search"
          placeholder="ابحث عن مستند أو متطلب..."
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          className="w-full rounded-full border border-border bg-muted/30 px-12 py-3.5 text-sm font-medium text-foreground outline-none transition-all placeholder:text-muted-foreground/50 focus:border-ring focus:bg-background"
        />
        <Search className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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
    <div className="space-y-6 rounded-[32px] border border-border bg-card p-8 shadow-sm">
      <div className="space-y-1.5 text-right">
        <div className="text-[15px] font-black tracking-tight text-foreground">{title}</div>
        <div className="text-[13px] font-medium text-muted-foreground">{subtitle}</div>
      </div>

      <input ref={inputRef} type="file" multiple className="hidden" onChange={(event) => void onFilesChange(event)} />
      
      <button 
        type="button" 
        onClick={() => inputRef.current?.click()} 
        className="flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-sm font-bold text-muted-foreground transition hover:border-ring/40 hover:bg-muted/30"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
           <Upload size={18} />
        </div>
        {isUploading ? uploadingLabel : idleLabel}
      </button>

      <div className="grid gap-2">
        {docs.map((doc) => (
          <div key={doc.key} className="group flex items-center justify-between rounded-xl border border-border bg-background py-2.5 pl-3 pr-4 text-[13px] font-medium text-foreground transition hover:border-ring/40">
            <span className="truncate max-w-[200px]">{doc.name}</span>
            <button 
              type="button" 
              onClick={() => onRemoveDoc(doc.key)} 
              className="rounded-lg px-2.5 py-1 text-[11px] font-black uppercase text-muted-foreground transition hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400"
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
        className="rounded-full bg-muted px-8 py-3.5 text-xs font-black uppercase tracking-widest text-foreground transition hover:bg-muted/80"
      >
        رجوع
      </button>
      <div className="flex items-center gap-4">
        <button 
          type="button" 
          onClick={onSkip} 
          className="rounded-full border border-border bg-background px-8 py-3.5 text-xs font-black uppercase tracking-widest text-muted-foreground transition hover:bg-muted/20"
        >
          تخطي الآن
        </button>
        <button 
          type="button" 
          onClick={onSubmit} 
          disabled={isSubmitting} 
          className="rounded-full bg-foreground px-10 py-3.5 text-xs font-black uppercase tracking-widest text-background shadow-sm transition hover:bg-foreground/90 disabled:opacity-50"
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

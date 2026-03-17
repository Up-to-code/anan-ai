"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { RequirementItem, RequirementSourceLink } from "./requirements";
import { filterRequirements } from "./requirements";

type VerificationDocsStepProps = {
  organizationType: "broker" | "red";
  requirements: RequirementItem[];
  sources: RequirementSourceLink[];
  countryLabel?: string | null;
  onBack: () => void;
  onSkip: () => void;
};

/**
 * WHY:   Verification needs a clear checklist and a real document upload flow.
 * WHAT:  Lets users search requirements, upload docs, and submit verification requests.
 * HOW:   Uses UploadThing for uploads and posts to the verification request API.
 */
export default function VerificationDocsStep({
  organizationType,
  requirements,
  sources,
  countryLabel,
  onBack,
  onSkip,
}: VerificationDocsStepProps) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [requiredDocs, setRequiredDocs] = useState<UploadedFileReference[]>([]);
  const [proofDocs, setProofDocs] = useState<UploadedFileReference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const requiredInputRef = useRef<HTMLInputElement | null>(null);
  const proofInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("verificationDocuments");

  const filteredRequirements = useMemo(
    () => filterRequirements(requirements, query),
    [requirements, query],
  );
  const typeLabel = organizationType === "red" ? "مطور عقاري" : "وسيط عقاري";

  const handleUpload = async (
    files: File[],
    setter: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>,
  ) => {
    if (files.length === 0) return;
    setError(null);

    try {
      const uploaded = await startUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setter((current) => [...current, ...nextDocs]);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الملفات.");
    }
  };

  const handleRequiredFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    await handleUpload(files, setRequiredDocs);
    event.target.value = "";
  };

  const handleProofFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    await handleUpload(files, setProofDocs);
    event.target.value = "";
  };

  const handleSubmit = async () => {
    setError(null);

    if (requiredDocs.length === 0) {
      setError("الرجاء رفع مستند واحد على الأقل من المستندات الأساسية.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/verification-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documents: requiredDocs,
          proofDocuments: proofDocs,
          requirements: Object.keys(selected).filter((key) => selected[key]),
          sourceUrls: sources.map((source) => source.url),
          organizationType,
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "تعذر إرسال الطلب.");
      }

      onSkip();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إرسال الطلب.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleRequirement = (id: string) => {
    setSelected((current) => ({ ...current, [id]: !current[id] }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="text-sm font-black text-slate-900">التوثيق والمستندات</div>
        <p className="text-sm text-slate-500">
          ارفع مستنداتك لإثبات الهوية والنشاط. القائمة أدناه مرجع إرشادي ويمكن تحديثها لاحقاً.
        </p>
      </div>

      <div className="space-y-4 border-2 border-slate-100 bg-white p-5">
        <div className="space-y-1">
          <div className="text-sm font-black text-slate-900">
            مرجع المتطلبات {countryLabel ?? "للامتثال"}
          </div>
          <div className="text-xs text-slate-500">القائمة الحالية: {typeLabel}</div>
        </div>
        <input
          type="search"
          placeholder="ابحث عن مستند أو متطلب..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full border-2 border-slate-100 bg-white px-3 py-2 text-sm text-slate-900"
        />
        <div className="grid gap-3">
          {filteredRequirements.length > 0 ? (
            filteredRequirements.map((item) => (
              <label
                key={item.id}
                className="flex items-start gap-3 border-2 border-slate-100 bg-white px-3 py-3 text-sm text-slate-800"
              >
                <input
                  type="checkbox"
                  checked={Boolean(selected[item.id])}
                  onChange={() => toggleRequirement(item.id)}
                  className="mt-1"
                />
                <span className="space-y-1">
                  <span className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
                    {item.label}
                    <span
                      className={`border-2 px-2 py-0.5 text-[10px] font-black ${
                        item.required
                          ? "border-amber-200 bg-amber-50 text-amber-800"
                          : "border-slate-100 bg-white text-slate-500"
                      }`}
                    >
                      {item.required ? "أساسي" : "اختياري"}
                    </span>
                  </span>
                  {item.note ? <span className="block text-xs text-slate-500">{item.note}</span> : null}
                </span>
              </label>
            ))
          ) : (
            <div className="border-2 border-slate-100 bg-white px-3 py-2 text-xs text-slate-500">
              لا توجد نتائج مطابقة.
            </div>
          )}
        </div>
        <div className="text-xs text-slate-500">
          المصادر الرسمية:
          <span className="ml-2 inline-flex flex-wrap gap-2">
            {sources.map((source) => (
              <a
                key={source.id}
                href={source.url}
                target="_blank"
                rel="noreferrer"
                className="text-slate-700 underline underline-offset-2"
              >
                {source.label}
              </a>
            ))}
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4 border-2 border-slate-100 bg-white p-4">
          <div className="space-y-1">
            <div className="text-sm font-black text-slate-900">المستندات الأساسية</div>
            <div className="text-xs text-slate-500">ملفات الهوية والسجلات النظامية الأساسية.</div>
          </div>
          <input ref={requiredInputRef} type="file" multiple className="hidden" onChange={handleRequiredFiles} />
          <button
            type="button"
            onClick={() => requiredInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-100 bg-white px-4 py-6 text-sm font-bold text-slate-700"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "جارٍ رفع الملفات..." : "رفع ملفات PDF أو صور"}
          </button>
          <div className="grid gap-2">
            {requiredDocs.map((doc) => (
              <div
                key={doc.key}
                className="flex items-center justify-between border-2 border-slate-100 bg-white px-3 py-2 text-xs text-slate-700"
              >
                <span className="truncate">{doc.name}</span>
                <button
                  type="button"
                  onClick={() => setRequiredDocs((current) => current.filter((item) => item.key !== doc.key))}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  إزالة
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4 border-2 border-slate-100 bg-white p-4">
          <div className="space-y-1">
            <div className="text-sm font-black text-slate-900">إثبات العمل (اختياري)</div>
            <div className="text-xs text-slate-500">نماذج أعمال أو مستندات داعمة لنشاطك.</div>
          </div>
          <input ref={proofInputRef} type="file" multiple className="hidden" onChange={handleProofFiles} />
          <button
            type="button"
            onClick={() => proofInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 border-2 border-dashed border-slate-100 bg-white px-4 py-6 text-sm font-bold text-slate-700"
          >
            <Upload className="h-4 w-4" />
            {isUploading ? "جارٍ رفع الملفات..." : "أضف نماذج أعمال أو موافقات مشاريع"}
          </button>
          <div className="grid gap-2">
            {proofDocs.map((doc) => (
              <div
                key={doc.key}
                className="flex items-center justify-between border-2 border-slate-100 bg-white px-3 py-2 text-xs text-slate-700"
              >
                <span className="truncate">{doc.name}</span>
                <button
                  type="button"
                  onClick={() => setProofDocs((current) => current.filter((item) => item.key !== doc.key))}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  إزالة
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {error ? (
        <div className="border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
        >
          رجوع
        </button>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onSkip}
            className="border-2 border-blue-600 bg-white px-8 py-2.5 text-xs font-black uppercase tracking-widest text-blue-600 transition hover:bg-blue-50"
          >
            تخطي الآن
          </button>
          <button
            type="button"
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="border-2 border-blue-600 bg-blue-600 px-8 py-2.5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {isSubmitting ? "جارٍ الإرسال..." : "إرسال الطلب"}
          </button>
        </div>
      </div>
    </div>
  );
}

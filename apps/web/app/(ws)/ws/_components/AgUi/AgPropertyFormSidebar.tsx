import { AlertCircle, Check, ChevronRight, PlayCircle, Upload, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";

type AgPropertyFormSidebarProps = {
  adLicenseLabel: string;
  adLicenseTone: string;
  formState: AgPropertyFormState;
  handleImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseSubmit: () => Promise<void>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  isLicenseUploading: boolean;
  isUploading: boolean;
  licenseDocs: UploadedFileReference[];
  licenseError: string | null;
  licenseInputRef: React.MutableRefObject<HTMLInputElement | null>;
  licenseSubmitted: boolean;
  licenseSubmitting: boolean;
  onRemoveImage: (index: number) => void;
  propertyId?: string;
  savePending: boolean;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setLicenseDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
  setShowSafetyConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  submitLabel: string;
  uploadError: string | null;
};

export function AgPropertyFormSidebar({
  adLicenseLabel,
  adLicenseTone,
  formState,
  handleImageSelection,
  handleLicenseFiles,
  handleLicenseSubmit,
  inputRef,
  isLicenseUploading,
  isUploading,
  licenseDocs,
  licenseError,
  licenseInputRef,
  licenseSubmitted,
  licenseSubmitting,
  onRemoveImage,
  propertyId,
  savePending,
  setFormState,
  setLicenseDocs,
  setShowSafetyConfirm,
  submitLabel,
  uploadError,
}: AgPropertyFormSidebarProps) {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <div className="mb-6 flex flex-row-reverse items-center justify-between border-b border-slate-100 pb-4">
          <h3 className="text-lg font-black text-slate-950">المعرض المرئي</h3>
          <span className="rounded-md bg-slate-50 px-2 py-1 text-[10px] font-black tracking-widest text-slate-400">{formState.images.length}/10</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(event) => void handleImageSelection(event)} />
          <div
            className="group col-span-2 flex aspect-video cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition-all hover:border-blue-600 hover:bg-white"
            onClick={() => inputRef.current?.click()}
          >
            <Upload className="h-6 w-6 text-slate-300 transition-colors duration-300 group-hover:text-blue-600" />
            <div className="text-sm font-black text-slate-900">{isUploading ? "جارٍ رفع الصور..." : "إضافة صور"}</div>
            <div className="text-[10px] font-bold tracking-widest text-slate-400">UploadThing</div>
          </div>
          {uploadError ? (
            <div className="col-span-2 border border-red-200 bg-red-50 px-4 py-3 text-right text-xs font-bold text-red-700">{uploadError}</div>
          ) : null}

          {formState.images.map((img, idx) => (
            <div key={idx} className="group relative aspect-square overflow-hidden rounded-lg border-2 border-slate-100 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.name} className="h-full w-full object-cover transition duration-700 hover:scale-105" />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveImage(idx);
                }}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-md bg-white/90 text-red-600 opacity-0 shadow transition group-hover:opacity-100 hover:bg-red-600 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          <div
            className={cn(
              "group mt-2 col-span-2 flex cursor-pointer flex-row-reverse items-center justify-between rounded-lg border-2 p-4 text-right transition-all",
              formState.video
                ? "border-blue-600 bg-blue-50/20"
                : "border-slate-100 bg-white hover:border-slate-300",
            )}
            onClick={() => setFormState((prev) => ({ ...prev, video: prev.video ? null : "mock-video.mp4" }))}
          >
            <div className="flex flex-row-reverse items-center gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                  formState.video ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-slate-50 text-slate-400 group-hover:bg-slate-100",
                )}
              >
                {formState.video ? <PlayCircle className="h-4 w-4" /> : <Video className="h-4 w-4" />}
              </div>
              <div className="grid gap-0 leading-tight">
                <div className="text-xs font-black uppercase text-slate-950">{formState.video ? "الفيديو جاهز" : "إضافة فيديو (اختياري)"}</div>
                <div className="text-[9px] font-bold tracking-widest text-slate-400">{formState.video ? "تم الاعتماد" : "صيغة MP4"}</div>
              </div>
            </div>
            {formState.video ? <Check className="h-4 w-4 text-blue-600" /> : null}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <h3 className="mb-8 border-b border-slate-100 pb-4 text-lg font-black text-slate-950">المواصفات والتحكم</h3>

        <div className="grid gap-6">
          <div className="grid gap-2 text-right">
            <label className="text-[10px] font-black tracking-widest text-slate-400">حالة الظهور</label>
            <div className="relative">
              <select
                value={formState.status}
                onChange={(e) => setFormState((prev) => ({ ...prev, status: e.target.value }))}
                className="w-full cursor-pointer appearance-none border-2 border-slate-100 bg-slate-50 px-4 py-3 text-right text-sm font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
              >
                <option value="active">جاهز للنشر ومتاح للجميع</option>
                <option value="pending">مسودة للحفظ فقط المراجعة</option>
                <option value="maintenance">إخفاء عن الجمهور (أرشفة)</option>
              </select>
              <ChevronRight className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-slate-300" />
            </div>
          </div>

          <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50/60 p-4 text-right">
            <div className="flex items-center justify-between">
              <div className="text-xs font-black text-slate-900">ترخيص الإعلان العقاري</div>
              <span className={`rounded-lg border px-3 py-1 text-[10px] font-black ${adLicenseTone}`}>{adLicenseLabel}</span>
            </div>
            <input
              type="text"
              value={formState.adLicenseNumber}
              onChange={(e) => setFormState((prev) => ({ ...prev, adLicenseNumber: e.target.value }))}
              placeholder="رقم رخصة الإعلان"
              className="h-12 w-full rounded-lg border-2 border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:border-blue-600"
            />
            {propertyId ? (
              <div className="grid gap-3">
                <input ref={licenseInputRef} type="file" multiple className="hidden" onChange={(event) => void handleLicenseFiles(event)} />
                <button
                  type="button"
                  onClick={() => licenseInputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-xs font-black text-slate-700"
                >
                  <Upload className="h-4 w-4" />
                  {isLicenseUploading ? "جارٍ رفع المستندات..." : "رفع مستندات الترخيص"}
                </button>
                {licenseDocs.length > 0 ? (
                  <div className="grid gap-2">
                    {licenseDocs.map((doc) => (
                      <div key={doc.key} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-slate-600">
                        <span className="truncate">{doc.name}</span>
                        <button
                          type="button"
                          onClick={() => setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))}
                          className="text-[10px] text-slate-500 hover:text-slate-900"
                        >
                          إزالة
                        </button>
                      </div>
                    ))}
                  </div>
                ) : null}
                {licenseError ? (
                  <div className="border border-rose-200 bg-rose-50 px-3 py-2 text-[10px] font-bold text-rose-700">{licenseError}</div>
                ) : null}
                {licenseSubmitted ? (
                  <div className="border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-bold text-emerald-700">تم إرسال الطلب بنجاح.</div>
                ) : null}
                <button
                  type="button"
                  onClick={() => void handleLicenseSubmit()}
                  disabled={licenseSubmitting}
                  className="h-11 rounded-lg border-2 border-slate-950 bg-slate-950 px-4 text-[10px] font-black tracking-[0.2em] text-white transition hover:border-blue-600 hover:bg-blue-600"
                >
                  {licenseSubmitting ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
                </button>
              </div>
            ) : (
              <div className="text-[10px] font-bold text-slate-500">احفظ المشروع أولاً لإرسال طلب ترخيص الإعلان.</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 text-right">
            <div className="grid gap-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400">الغرف</label>
              <input
                type="number"
                value={formState.rooms}
                onChange={(e) => setFormState((prev) => ({ ...prev, rooms: e.target.value }))}
                placeholder="0"
                className="w-full border-2 border-slate-100 bg-slate-50 px-3 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-[10px] font-black tracking-widest text-slate-400">دورات المياه</label>
              <input
                type="number"
                value={formState.baths}
                onChange={(e) => setFormState((prev) => ({ ...prev, baths: e.target.value }))}
                placeholder="0"
                className="w-full border-2 border-slate-100 bg-slate-50 px-3 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid gap-2 text-right">
            <label className="text-[10px] font-black tracking-widest text-slate-400">المساحة م²</label>
            <input
              type="text"
              value={formState.area}
              onChange={(e) => setFormState((prev) => ({ ...prev, area: e.target.value }))}
              placeholder="0"
              className="w-full border-2 border-slate-100 bg-slate-50 px-4 py-3 text-right text-lg font-black text-slate-950 outline-none transition-all focus:border-blue-600 focus:bg-white"
            />
          </div>
        </div>
      </div>

      <div className="border border-slate-200 bg-white p-8">
        <div className="mb-6 flex flex-row-reverse items-start gap-3 border border-slate-100 bg-slate-50 p-4 text-right">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-slate-400" />
          <p className="text-[10px] font-bold leading-relaxed text-slate-600">
            إن النشر يؤثر فوراً على ظهور المشروع في التطبيقات. يرجى التأكد من المرفقات.
          </p>
        </div>
        <button
          onClick={() => setShowSafetyConfirm(true)}
          disabled={savePending}
          className="flex w-full items-center justify-center bg-blue-600 py-5 text-sm font-black tracking-[0.2em] text-white transition-colors hover:bg-slate-950"
        >
          {savePending ? "جارٍ الحفظ..." : submitLabel}
        </button>
      </div>
    </div>
  );
}

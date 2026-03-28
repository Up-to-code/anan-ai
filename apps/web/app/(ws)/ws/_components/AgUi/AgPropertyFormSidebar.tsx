import { AlertCircle, CheckCircle2, FileCheck2, ImagePlus, Upload, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";

type AgPropertyFormSidebarProps = {
  adLicenseLabel: string;
  adLicenseTone: string;
  formState: AgPropertyFormState;
  handleImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handlePermitFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
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
  permitInputRef: React.MutableRefObject<HTMLInputElement | null>;
  propertyId?: string;
  savePending: boolean;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setLicenseDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
  setShowSafetyConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  submitLabel: string;
  uploadError: string | null;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
      <div className="mb-5 border-b border-[color:var(--workspace-border)] pb-4">
        <h3 className="text-lg font-black text-[var(--workspace-bubble-other-foreground)]">{title}</h3>
        {description ? <p className="mt-2 text-sm leading-6 text-[var(--workspace-muted)]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">{children}</label>;
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="min-h-[52px] w-full rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)] disabled:bg-[var(--workspace-accent-soft)] disabled:text-[var(--workspace-muted)]"
    />
  );
}

function UploadTile({
  title,
  subtitle,
  onClick,
  icon,
  disabled = false,
}: {
  title: string;
  subtitle?: string;
  onClick: () => void;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-between gap-3 rounded-2xl border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-4 text-right transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)] hover:bg-[var(--workspace-panel)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="text-right">
        <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">{title}</div>
        {subtitle ? <div className="mt-1 text-xs font-semibold text-[var(--workspace-muted)]">{subtitle}</div> : null}
      </div>
      <div className="text-[var(--workspace-muted)]">{icon}</div>
    </button>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  file: UploadedFileReference;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3">
      <button
        type="button"
        onClick={onRemove}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] text-[var(--workspace-muted)] transition hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_28%,transparent)] hover:text-[var(--workspace-bubble-other-foreground)]"
      >
        <X className="h-4 w-4" />
      </button>
      <div className="min-w-0 flex-1 text-right">
        <div className="truncate text-sm font-bold text-[var(--workspace-bubble-other-foreground)]">{file.name}</div>
      </div>
    </div>
  );
}

function MediaSection(props: Pick<
  AgPropertyFormSidebarProps,
  "formState" | "handleImageSelection" | "inputRef" | "isUploading" | "onRemoveImage" | "setFormState" | "uploadError"
>) {
  return (
    <SectionCard title="الصور والمعرض" description="اختر صوراً واضحة تمثل المشروع. أول صورة ستستخدم كصورة رئيسية.">
      <div className="space-y-4">
        <input
          ref={props.inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void props.handleImageSelection(event)}
        />
        <UploadTile
          title={props.isUploading ? "جارٍ رفع الصور..." : "إضافة صور المشروع"}
          subtitle={`${props.formState.images.length} صورة مرفوعة`}
          onClick={() => props.inputRef.current?.click()}
          icon={<ImagePlus className="h-5 w-5" />}
          disabled={props.isUploading}
        />

        {props.uploadError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
            {props.uploadError}
          </div>
        ) : null}

        {props.formState.images.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {props.formState.images.map((image, index) => (
              <div
                key={`${image.key}-${index}`}
                className="group relative aspect-[4/3] overflow-hidden rounded-[22px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)]"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image.url} alt={image.name} className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => props.onRemoveImage(index)}
                  className="absolute left-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/80 opacity-0 transition group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-6 text-center text-sm font-semibold text-[var(--workspace-muted)]">
            لا توجد صور مرفوعة بعد.
          </div>
        )}

        <button
          type="button"
          onClick={() =>
            props.setFormState((prev) => ({
              ...prev,
              video: prev.video ? null : "mock-video.mp4",
            }))
          }
          className={cn(
            "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-4 text-right transition",
            props.formState.video
              ? "border-emerald-500/25 bg-emerald-500/10"
              : "border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] hover:border-[color:color-mix(in_srgb,var(--workspace-highlight)_32%,transparent)]",
          )}
        >
          <div className="text-right">
            <div className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">
              {props.formState.video ? "الفيديو مفعّل" : "تفعيل فيديو توضيحي"}
            </div>
            <div className="mt-1 text-xs font-semibold text-[var(--workspace-muted)]">
              {props.formState.video ? "يمكنك إزالة الفيديو من هنا." : "خيار اختياري لعرض فيديو المشروع."}
            </div>
          </div>
          <div className={props.formState.video ? "text-emerald-300" : "text-[var(--workspace-muted)]"}>
            <Video className="h-5 w-5" />
          </div>
        </button>
      </div>
    </SectionCard>
  );
}

function SpecsSection({
  adLicenseLabel,
  adLicenseTone,
  formState,
  setFormState,
}: Pick<AgPropertyFormSidebarProps, "adLicenseLabel" | "adLicenseTone" | "formState" | "setFormState">) {
  return (
    <SectionCard title="المواصفات" description="اضبط حالة المشروع والمعلومات الأساسية التي تظهر في المعرض والبطاقات.">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>حالة المشروع</Label>
          <select
            value={formState.status}
            onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
            className="min-h-[52px] w-full rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)]"
          >
            <option value="active">جاهز للنشر</option>
            <option value="pending">مسودة</option>
            <option value="maintenance">مؤرشف أو مخفي</option>
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <div className="grid gap-2">
            <Label>الغرف</Label>
            <Input
              type="number"
              value={formState.rooms}
              onChange={(value) => setFormState((prev) => ({ ...prev, rooms: value }))}
              placeholder="0"
            />
          </div>
          <div className="grid gap-2">
            <Label>الحمامات</Label>
            <Input
              type="number"
              value={formState.baths}
              onChange={(value) => setFormState((prev) => ({ ...prev, baths: value }))}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid gap-2">
          <Label>المساحة بالمتر</Label>
          <Input
            value={formState.area}
            onChange={(value) => setFormState((prev) => ({ ...prev, area: value }))}
            placeholder="مثال: 380"
          />
        </div>

        <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">المواقف</span>
            <label className="flex items-center gap-2 text-sm font-semibold text-[var(--workspace-bubble-other-foreground)]">
              <span>متوفر</span>
              <input
                type="checkbox"
                checked={formState.hasParking}
                onChange={(event) =>
                  setFormState((prev) => ({
                    ...prev,
                    hasParking: event.target.checked,
                    parkingSpaces: event.target.checked ? prev.parkingSpaces : "",
                  }))
                }
                className="h-4 w-4 accent-stone-900"
              />
            </label>
          </div>
          <Input
            type="number"
            value={formState.parkingSpaces}
            onChange={(value) => setFormState((prev) => ({ ...prev, parkingSpaces: value }))}
            placeholder="عدد المواقف"
            disabled={!formState.hasParking}
          />
        </div>

        <div className="rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4">
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-sm font-black text-[var(--workspace-bubble-other-foreground)]">توثيق الإعلان</span>
            <span className={`rounded-full border px-3 py-1 text-xs font-bold ${adLicenseTone}`}>
              {adLicenseLabel}
            </span>
          </div>
          <p className="text-sm text-[var(--workspace-muted)]">يمكنك إدخال رقم الرخصة الآن ورفع المستندات بعد حفظ المشروع.</p>
        </div>
      </div>
    </SectionCard>
  );
}

function LicenseSection(props: Pick<
  AgPropertyFormSidebarProps,
  | "formState"
  | "handleLicenseFiles"
  | "handleLicenseSubmit"
  | "isLicenseUploading"
  | "licenseDocs"
  | "licenseError"
  | "licenseInputRef"
  | "licenseSubmitted"
  | "licenseSubmitting"
  | "propertyId"
  | "setFormState"
  | "setLicenseDocs"
>) {
  return (
    <SectionCard title="رخصة الإعلان" description="أدخل رقم الرخصة ثم ارفع المستندات عندما يكون المشروع محفوظاً.">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label>رقم الرخصة</Label>
          <Input
            value={props.formState.adLicenseNumber}
            onChange={(value) => props.setFormState((prev) => ({ ...prev, adLicenseNumber: value }))}
            placeholder="مثال: AD-12345"
          />
        </div>

        {props.propertyId ? (
          <>
            <input
              ref={props.licenseInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(event) => void props.handleLicenseFiles(event)}
            />
            <UploadTile
              title={props.isLicenseUploading ? "جارٍ رفع المستندات..." : "رفع مستندات الرخصة"}
              subtitle={props.licenseDocs.length > 0 ? `${props.licenseDocs.length} ملف` : "PDF أو صور واضحة"}
              onClick={() => props.licenseInputRef.current?.click()}
              icon={<Upload className="h-5 w-5" />}
              disabled={props.isLicenseUploading}
            />

            {props.licenseDocs.length > 0 ? (
              <div className="space-y-2">
                {props.licenseDocs.map((doc) => (
                  <FileRow
                    key={doc.key}
                    file={doc}
                    onRemove={() =>
                      props.setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))
                    }
                  />
                ))}
              </div>
            ) : null}

            {props.licenseError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {props.licenseError}
              </div>
            ) : null}

            {props.licenseSubmitted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                تم إرسال طلب التوثيق بنجاح.
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => void props.handleLicenseSubmit()}
              disabled={props.licenseSubmitting}
              className="w-full rounded-2xl border border-stone-950 bg-stone-950 px-4 py-3 text-sm font-bold text-white transition hover:bg-stone-800 disabled:opacity-60"
            >
              {props.licenseSubmitting ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
            </button>
          </>
        ) : (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            احفظ المشروع أولاً حتى تتمكن من رفع المستندات وإرسال الطلب.
          </div>
        )}
      </div>
    </SectionCard>
  );
}

function PrivatePermitSection(props: Pick<
  AgPropertyFormSidebarProps,
  "formState" | "handlePermitFiles" | "permitInputRef" | "setFormState"
>) {
  return (
    <SectionCard title="تصريح خاص للمحادثة" description="يظهر فقط للشخص الذي فُتح له المشروع عبر محادثة مشاركة خاصة.">
      <div className="space-y-4">
        <textarea
          rows={4}
          value={props.formState.privatePermitSummary}
          onChange={(event) =>
            props.setFormState((prev) => ({ ...prev, privatePermitSummary: event.target.value }))
          }
          placeholder="اكتب ملخصاً قصيراً يشرح هذا التصريح أو التخصيص الخاص."
          className="w-full resize-none rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-4 py-3 text-base font-semibold text-[var(--workspace-bubble-other-foreground)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[color:color-mix(in_srgb,var(--workspace-highlight)_36%,transparent)] focus:bg-[var(--workspace-panel)]"
        />

        <input
          ref={props.permitInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(event) => void props.handlePermitFiles(event)}
        />
        <UploadTile
          title="رفع ملفات التصريح الخاص"
          subtitle={
            props.formState.privatePermitFiles.length > 0
              ? `${props.formState.privatePermitFiles.length} ملف`
              : "لن يراها إلا الطرف المصرح له"
          }
          onClick={() => props.permitInputRef.current?.click()}
          icon={<FileCheck2 className="h-5 w-5" />}
        />

        {props.formState.privatePermitFiles.length > 0 ? (
          <div className="space-y-2">
            {props.formState.privatePermitFiles.map((doc) => (
              <FileRow
                key={doc.key}
                file={doc}
                onRemove={() =>
                  props.setFormState((prev) => ({
                    ...prev,
                    privatePermitFiles: prev.privatePermitFiles.filter((item) => item.key !== doc.key),
                  }))
                }
              />
            ))}
          </div>
        ) : null}
      </div>
    </SectionCard>
  );
}

function SaveSection({
  savePending,
  setShowSafetyConfirm,
  submitLabel,
}: Pick<AgPropertyFormSidebarProps, "savePending" | "setShowSafetyConfirm" | "submitLabel">) {
  return (
    <section className="rounded-[28px] border border-[color:var(--workspace-border)] bg-[var(--workspace-sidebar-strong)] p-6 text-[var(--workspace-bubble-other-foreground)] shadow-[0_16px_44px_rgba(0,0,0,0.28)]">
      <div className="flex items-start gap-3 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)]/40 p-4 text-right">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
        <p className="text-sm leading-6 text-[var(--workspace-muted)]">
          تمت تهيئة النموذج ليعمل بشكل أنظف في Safari أيضاً: أحجام حقول أوضح، تمدد أقل، وتحكم أبسط في الرفع والحفظ.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowSafetyConfirm(true)}
        disabled={savePending}
        className="mt-5 w-full rounded-2xl bg-[var(--workspace-highlight)] px-4 py-4 text-base font-black text-[var(--primary-foreground)] transition hover:brightness-110 disabled:opacity-60"
      >
        {savePending ? "جارٍ الحفظ..." : submitLabel}
      </button>

      <div className="mt-4 flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
        <CheckCircle2 className="h-4 w-4" />
        سيتم حفظ المشروع وفق الحالة التي اخترتها في الأعلى.
      </div>
    </section>
  );
}

export function AgPropertyFormSidebar({
  adLicenseLabel,
  adLicenseTone,
  formState,
  handleImageSelection,
  handleLicenseFiles,
  handlePermitFiles,
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
  permitInputRef,
  propertyId,
  savePending,
  setFormState,
  setLicenseDocs,
  setShowSafetyConfirm,
  submitLabel,
  uploadError,
}: AgPropertyFormSidebarProps) {
  return (
    <div className="min-w-0 space-y-6">
      <MediaSection
        formState={formState}
        handleImageSelection={handleImageSelection}
        inputRef={inputRef}
        isUploading={isUploading}
        onRemoveImage={onRemoveImage}
        setFormState={setFormState}
        uploadError={uploadError}
      />

      <SpecsSection
        adLicenseLabel={adLicenseLabel}
        adLicenseTone={adLicenseTone}
        formState={formState}
        setFormState={setFormState}
      />

      <LicenseSection
        formState={formState}
        handleLicenseFiles={handleLicenseFiles}
        handleLicenseSubmit={handleLicenseSubmit}
        isLicenseUploading={isLicenseUploading}
        licenseDocs={licenseDocs}
        licenseError={licenseError}
        licenseInputRef={licenseInputRef}
        licenseSubmitted={licenseSubmitted}
        licenseSubmitting={licenseSubmitting}
        propertyId={propertyId}
        setFormState={setFormState}
        setLicenseDocs={setLicenseDocs}
      />

      <PrivatePermitSection
        formState={formState}
        handlePermitFiles={handlePermitFiles}
        permitInputRef={permitInputRef}
        setFormState={setFormState}
      />

      <SaveSection
        savePending={savePending}
        setShowSafetyConfirm={setShowSafetyConfirm}
        submitLabel={submitLabel}
      />
    </div>
  );
}

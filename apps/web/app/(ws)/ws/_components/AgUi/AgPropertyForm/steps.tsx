import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileCheck2,
  ImagePlus,
  MapPin,
  Search,
  Upload,
  Video,
  X,
} from "lucide-react";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { BrokerPresence } from "../../Visuals/BrokerPresenceChip";
import type { ProjectFormFieldErrors } from "../../../(zones)/projects/projectFormSubmission";
import { BrokerAvatar, FieldLabel, ReviewRow, SectionCard, TextArea, TextInput, UploadTile } from "./controls";
import { GALLERY_ASPECT_OPTIONS, GALLERY_DISPLAY_OPTIONS, STEP_DEFINITIONS } from "./shared";
import type { AgPropertyFormState } from "./shared";

function StepShell({
  badge,
  title,
  description,
  checklist,
  children,
}: {
  badge: string;
  title: string;
  description: string;
  checklist: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-5 text-right lg:p-6">
        <div className="inline-flex rounded-full border border-[color:color-mix(in_srgb,var(--workspace-highlight)_18%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_8%,var(--workspace-panel))] px-3 py-1.5 text-[11px] font-black text-foreground">
          {badge}
        </div>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-[var(--workspace-muted)]">{description}</p>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {checklist.map((item) => (
            <span
              key={item}
              className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-1.5 text-[12px] font-semibold text-[var(--workspace-muted)]"
            >
              {item}
            </span>
          ))}
        </div>
      </section>

      {children}
    </div>
  );
}

export function BasicStep({
  formState,
  fieldErrors,
  setFormState,
}: {
  formState: AgPropertyFormState;
  fieldErrors: ProjectFormFieldErrors;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  return (
    <StepShell
      badge="الخطوة 1"
      title="ابدأ بتعريف المشروع بوضوح"
      description="هذه البطاقة تضع الأساس الذي سيظهر في القوائم وصفحة المشروع ونقاط الوصول داخل المنصة."
      checklist={["اسم واضح وسهل التذكر", "سعر مكتوب بصياغة مفهومة", "موقع يختصر المنطقة المستهدفة"]}
    >
      <SectionCard title="بطاقة تعريف المشروع" description="سجّل البيانات الأساسية كما تريد أن يفهمها الفريق والمستلم من أول نظرة.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>اسم المشروع</FieldLabel>
            <TextInput
              value={formState.name}
              onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
              placeholder="مثال: أبراج الياسمين"
              icon={<Building2 className="h-4 w-4" />}
              error={fieldErrors.name}
            />
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="grid gap-2">
              <FieldLabel>السعر</FieldLabel>
              <TextInput
                value={formState.price}
                onChange={(value) => setFormState((prev) => ({ ...prev, price: value }))}
                placeholder="مثال: 2,500,000 ر.س"
                error={fieldErrors.price}
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>الموقع</FieldLabel>
              <TextInput
                value={formState.location}
                onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))}
                placeholder="مثال: جدة، أبحر الشمالية"
                icon={<MapPin className="h-4 w-4" />}
                error={fieldErrors.location}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <FieldLabel>طريقة الظهور</FieldLabel>
            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "public" }))}
                className={`rounded-2xl border px-5 py-4 text-right transition ${
                  formState.clientVisibility === "public"
                    ? "border-emerald-500 bg-emerald-500/10 text-foreground"
                    : "border-border bg-muted/10 text-muted-foreground"
                }`}
              >
                <div className="text-sm font-black">مرئي للعميل والـ AI</div>
                <div className="mt-1 text-xs font-semibold">يظهر في القنوات العامة بعد النشر ويصبح جاهزاً للاستخدام البيعي.</div>
              </button>
              <button
                type="button"
                onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "private" }))}
                className={`rounded-2xl border px-5 py-4 text-right transition ${
                  formState.clientVisibility === "private"
                    ? "border-amber-500 bg-amber-500/10 text-foreground"
                    : "border-border bg-muted/10 text-muted-foreground"
                }`}
              >
                <div className="text-sm font-black">داخلي داخل مساحة العمل</div>
                <div className="mt-1 text-xs font-semibold">يبقى للفريق فقط إلى أن تقرر مشاركته أو نشره لاحقاً.</div>
              </button>
            </div>
          </div>
        </div>
      </SectionCard>
    </StepShell>
  );
}

export function ContentStep({
  formState,
  fieldErrors,
  setFormState,
}: {
  formState: AgPropertyFormState;
  fieldErrors: ProjectFormFieldErrors;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  return (
    <StepShell
      badge="الخطوة 2"
      title="اصنع الرسالة التي ستبيع المشروع"
      description="رتّب النصوص هنا كما لو أنك تسلّم المشروع لفريق المبيعات أو تعرضه في صفحة جاهزة للنشر."
      checklist={["وصف كامل يشرح الصورة", "ملخص قصير سريع القراءة", "مزايا مفصولة وواضحة"]}
    >
      <SectionCard title="الوصف الرئيسي" description="اكتب النص الأساسي الذي يشرح المشروع ونوع الوحدات ونقاط القوة بشكل مباشر.">
        <TextArea
          rows={8}
          value={formState.description}
          onChange={(value) => setFormState((prev) => ({ ...prev, description: value }))}
          placeholder="اشرح المشروع، طبيعة الوحدات، المنطقة، قيمة الشراء، وأي تفاصيل يحتاجها الوسيط أو العميل لفهم العرض."
          error={fieldErrors.description}
        />
      </SectionCard>

      <SectionCard title="الملخص والمزايا" description="هذه العناصر تساعد على تقديم المشروع بسرعة داخل الصفحة والبطاقات والمشاركات المختصرة.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>ملخص سريع</FieldLabel>
            <TextArea
              rows={3}
              value={formState.shortDescription}
              onChange={(value) => setFormState((prev) => ({ ...prev, shortDescription: value }))}
              placeholder="اكتب سطرين أو ثلاثة يشرحان قيمة المشروع بسرعة."
              error={fieldErrors.shortDescription}
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel>المزايا والخدمات</FieldLabel>
            <TextArea
              rows={4}
              value={formState.amenitiesText}
              onChange={(value) => setFormState((prev) => ({ ...prev, amenitiesText: value }))}
              placeholder="مثال: مواقف خاصة، نادي، مسارات مشي، مصاعد ذكية، حراسة"
              error={fieldErrors.amenitiesText}
            />
            <p className="text-sm text-muted-foreground">افصل بين كل ميزة بفاصلة أو سطر جديد حتى تتحول إلى بطاقات واضحة في صفحة المشروع.</p>
          </div>
        </div>
      </SectionCard>
    </StepShell>
  );
}

export function GalleryStep(props: {
  fieldErrors: ProjectFormFieldErrors;
  formState: AgPropertyFormState;
  handleImageSelection: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  inputRef: React.MutableRefObject<HTMLInputElement | null>;
  isUploading: boolean;
  moveImage: (fromIndex: number, offset: -1 | 1) => void;
  previewAspectClass: string;
  previewObjectClass: string;
  removeImage: (index: number) => void;
  setCoverImageKey: (nextCoverImageKey: string | null) => void;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  uploadError: string | null;
}) {
  return (
    <StepShell
      badge="الخطوة 3"
      title="رتّب الصورة البصرية للمشروع"
      description="املأ هذه الخطوة بالصور التي تريد أن تقود الانطباع الأول، ثم اختر صورة الغلاف وطريقة عرضها."
      checklist={["صورة غلاف قوية", "ترتيب الصور حسب الأولوية", "أسلوب عرض مناسب لكل لقطة"]}
    >
      <SectionCard title="مكتبة الصور" description="ارفع الصور الأساسية ثم اختر الغلاف ورتّب التسلسل كما تريد أن يراه المستلم.">
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
          {props.fieldErrors.images ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {props.fieldErrors.images}
            </div>
          ) : null}

          {props.formState.images.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {props.formState.images.map((image, index) => {
                const isCover = props.formState.coverImageKey === image.key;
                return (
                  <div key={`${image.key}-${index}`} className="rounded-xl border border-border bg-card p-3">
                    <div className={["overflow-hidden rounded-lg border border-border bg-muted/20", props.previewAspectClass].join(" ")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className={`h-full w-full ${props.previewObjectClass}`}
                      />
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <div className="min-w-0 text-right">
                        <div className="truncate text-[13px] font-black text-foreground">{image.name}</div>
                        <div className="mt-1 text-xs font-semibold text-muted-foreground">
                          {isCover ? "صورة الغلاف الحالية" : `الصورة رقم ${index + 1}`}
                        </div>
                      </div>
                      {isCover ? (
                        <span className="rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-300">
                          غلاف
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button
                        type="button"
                        onClick={() => props.setCoverImageKey(image.key)}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30"
                      >
                        غلاف
                      </button>
                      <button
                        type="button"
                        onClick={() => props.moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        رفع
                      </button>
                      <button
                        type="button"
                        onClick={() => props.moveImage(index, 1)}
                        disabled={index === props.formState.images.length - 1}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        خفض
                      </button>
                      <button
                        type="button"
                        onClick={() => props.removeImage(index)}
                        className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700 transition hover:border-rose-300"
                      >
                        إزالة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-8 text-center text-sm font-semibold text-muted-foreground">
              ارفع صور المشروع أولاً لتظهر أدوات الترتيب والغلاف.
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard title="طريقة عرض المعرض" description="حدد كيف ستظهر الصور داخل صفحة المشروع حتى تبقى القراءة البصرية متناسقة.">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel>طريقة عرض الصورة</FieldLabel>
            <select
              value={props.formState.galleryDisplayMode}
              onChange={(event) =>
                props.setFormState((prev) => ({
                  ...prev,
                  galleryDisplayMode: event.target.value as AgPropertyFormState["galleryDisplayMode"],
                }))
              }
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              {GALLERY_DISPLAY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <FieldLabel>نسبة الإطار</FieldLabel>
            <select
              value={props.formState.galleryAspectRatio}
              onChange={(event) =>
                props.setFormState((prev) => ({
                  ...prev,
                  galleryAspectRatio: event.target.value as AgPropertyFormState["galleryAspectRatio"],
                }))
              }
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              {GALLERY_ASPECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => props.setFormState((prev) => ({ ...prev, video: prev.video ? null : "mock-video.mp4" }))}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-right transition hover:border-stone-400"
        >
          <div className="text-right">
            <div className="text-sm font-black text-foreground">
              {props.formState.video ? "الفيديو مفعّل" : "تفعيل فيديو توضيحي"}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {props.formState.video ? "يمكنك إيقافه أو تركه كإضافة داعمة للعرض." : "خيار إضافي لإرفاق فيديو قصير يدعم العرض البصري."}
            </div>
          </div>
          <Video className={`h-5 w-5 ${props.formState.video ? "text-emerald-300" : "text-muted-foreground"}`} />
        </button>
      </SectionCard>
    </StepShell>
  );
}

export function SpecsStep(props: {
  adLicenseLabel: string;
  adLicenseTone: string;
  fieldErrors: ProjectFormFieldErrors;
  formState: AgPropertyFormState;
  handleLicenseFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseSubmit: () => Promise<void>;
  isLicenseUploading: boolean;
  licenseDocs: UploadedFileReference[];
  licenseError: string | null;
  licenseInputRef: React.MutableRefObject<HTMLInputElement | null>;
  licenseSubmitted: boolean;
  licenseSubmitting: boolean;
  propertyId?: string;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setLicenseDocs: React.Dispatch<React.SetStateAction<UploadedFileReference[]>>;
}) {
  return (
    <StepShell
      badge="الخطوة 4"
      title="أكمل المواصفات والتوثيق"
      description="هذه الخطوة تثبّت الحالة التشغيلية للمشروع وتجمع الأرقام والبيانات التي يعتمد عليها العرض والمتابعة."
      checklist={["حالة تشغيل واضحة", "أرقام دقيقة للغرف والمساحة", "بيانات رخصة جاهزة للمراجعة"]}
    >
      <SectionCard title="مواصفات المشروع" description="راجع الحالة الحالية وأدخل التفاصيل الرقمية التي ستظهر في الصفحة وبطاقات المشروع.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>حالة المشروع</FieldLabel>
            <select
              value={props.formState.status}
              onChange={(event) => props.setFormState((prev) => ({ ...prev, status: event.target.value }))}
              className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 text-base font-semibold text-foreground outline-none transition focus:border-ring focus:bg-card"
            >
              <option value="active">جاهز للنشر</option>
              <option value="pending">مسودة</option>
              <option value="maintenance">مؤرشف أو مخفي</option>
            </select>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="grid gap-2">
              <FieldLabel>الغرف</FieldLabel>
              <TextInput
                type="number"
                value={props.formState.rooms}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, rooms: value }))}
                placeholder="0"
                error={props.fieldErrors.rooms}
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>الحمامات</FieldLabel>
              <TextInput
                type="number"
                value={props.formState.baths}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, baths: value }))}
                placeholder="0"
                error={props.fieldErrors.baths}
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>المساحة بالمتر</FieldLabel>
              <TextInput
                value={props.formState.area}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, area: value }))}
                placeholder="مثال: 380"
                error={props.fieldErrors.area}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="text-sm font-black text-foreground">المواقف</span>
              <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span>متوفر</span>
                <input
                  type="checkbox"
                  checked={props.formState.hasParking}
                  onChange={(event) =>
                    props.setFormState((prev) => ({
                      ...prev,
                      hasParking: event.target.checked,
                      parkingSpaces: event.target.checked ? prev.parkingSpaces : "",
                    }))
                  }
                  className="h-4 w-4 accent-stone-900"
                />
              </label>
            </div>
            <TextInput
              type="number"
              value={props.formState.parkingSpaces}
              onChange={(value) => props.setFormState((prev) => ({ ...prev, parkingSpaces: value }))}
              placeholder="عدد المواقف"
              disabled={!props.formState.hasParking}
              error={props.fieldErrors.parkingSpaces}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="ملف الرخصة والتوثيق" description="أدخل رقم الرخصة الآن، ثم أرفق مستندات التوثيق بعد حفظ المشروع لأول مرة.">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-black text-foreground">حالة التوثيق</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${props.adLicenseTone}`}>
                {props.adLicenseLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">ستبقى هذه الحالة محدثة عند إرسال أو مراجعة الطلب.</p>
          </div>

          <div className="grid gap-2">
            <FieldLabel>رقم رخصة الإعلان</FieldLabel>
            <TextInput
              value={props.formState.adLicenseNumber}
              onChange={(value) => props.setFormState((prev) => ({ ...prev, adLicenseNumber: value }))}
              placeholder="مثال: AD-12345"
              error={props.fieldErrors.adLicenseNumber}
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
                    <div key={doc.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => props.setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="truncate text-sm font-bold text-foreground">{doc.name}</div>
                    </div>
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
                className="w-full rounded-2xl border border-foreground/50 bg-foreground px-4 py-3 text-sm font-bold text-background transition hover:brightness-110 disabled:opacity-60"
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
    </StepShell>
  );
}

export function SharingStep(props: {
  brokerSearch: string;
  fieldErrors: ProjectFormFieldErrors;
  filteredBrokers: BrokerPresence[];
  formState: AgPropertyFormState;
  handlePermitFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void> | void;
  permitInputRef: React.MutableRefObject<HTMLInputElement | null>;
  selectedBroker?: BrokerPresence;
  setBrokerSearch: React.Dispatch<React.SetStateAction<string>>;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setSelectedBrokerId: React.Dispatch<React.SetStateAction<string | null>>;
}) {
  return (
    <StepShell
      badge="الخطوة 5"
      title="نظّم الوصول والمشاركة"
      description="اختر من يمكنه مشاهدة المشروع، وأضف أي تصريح خاص بالمحادثات، ثم اربطه بوسيط إذا كان ذلك مناسباً."
      checklist={["تحديد مستوى الخصوصية", "إضافة تصريح خاص عند الحاجة", "ربط المشروع بوسيط إن وجد"]}
    >
      <SectionCard
        title="رؤية المشروع"
        description="حدد ما إذا كان المشروع عاماً أو داخلياً، وتابع الجهات التي وصلت إليه عندما يكون خاصاً."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => props.setFormState((prev) => ({ ...prev, clientVisibility: "private" }))}
              className={`rounded-2xl border px-4 py-4 text-right transition ${
                props.formState.clientVisibility === "private"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">خاص</div>
              <div className="mt-1 text-xs opacity-80">يبقى داخل دائرة الوصول المصرح بها فقط.</div>
            </button>
            <button
              type="button"
              onClick={() => props.setFormState((prev) => ({ ...prev, clientVisibility: "public" }))}
              className={`rounded-2xl border px-4 py-4 text-right transition ${
                props.formState.clientVisibility === "public"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">عام</div>
              <div className="mt-1 text-xs opacity-80">جاهز للظهور في القنوات العامة بحسب حالة المشروع.</div>
            </button>
          </div>

          {props.formState.clientVisibility === "private" ? (
            <div className="space-y-3">
              {props.formState.visibilityMembers.length > 0 ? (
                props.formState.visibilityMembers.map((viewer) => (
                  <div
                    key={viewer.authUserId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <button
                      type="button"
                      disabled={!props.onRevokeViewer}
                      onClick={() => {
                        if (!props.onRevokeViewer) return;
                        void Promise.resolve(props.onRevokeViewer(viewer.authUserId)).then(() => {
                          props.setFormState((prev) => ({
                            ...prev,
                            visibilityMembers: prev.visibilityMembers.filter(
                              (entry) => entry.authUserId !== viewer.authUserId,
                            ),
                          }));
                        });
                      }}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-xs font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      إلغاء الوصول
                    </button>
                    <div className="text-right">
                      <div className="text-sm font-bold text-foreground">{viewer.name}</div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {viewer.email ?? "بدون بريد ظاهر"} · {viewer.accessSource === "chat_share" ? "من المحادثة" : "يدوي"}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm font-medium text-muted-foreground">
                  لا يوجد مشاهدون مضافون بعد. ستظهر هنا الجهات التي تفتح المشروع من مشاركة خاصة في المحادثات.
                </div>
              )}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="تصريح خاص للمحادثة" description="أضف ملخصاً أو ملفات لا تظهر إلا للطرف الذي استلم المشروع عبر مشاركة خاصة.">
        <div className="space-y-4">
          <TextArea
            rows={4}
            value={props.formState.privatePermitSummary}
            onChange={(value) => props.setFormState((prev) => ({ ...prev, privatePermitSummary: value }))}
            placeholder="اكتب ملخصاً قصيراً يشرح هذا التصريح أو التخصيص الخاص."
            error={props.fieldErrors.privatePermitSummary}
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
                <div key={doc.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      props.setFormState((prev) => ({
                        ...prev,
                        privatePermitFiles: prev.privatePermitFiles.filter((item) => item.key !== doc.key),
                      }))
                    }
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="truncate text-sm font-bold text-foreground">{doc.name}</div>
                </div>
              ))}
            </div>
          ) : null}
          {props.fieldErrors.privatePermitFiles ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {props.fieldErrors.privatePermitFiles}
            </div>
          ) : null}
        </div>
      </SectionCard>

      <SectionCard title="ربط المشروع بوسيط" description="اختياري. استخدمه عندما تريد أن يبدأ وسيط محدد من نفس السياق مباشرة.">
        {props.selectedBroker ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => props.setSelectedBrokerId(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                title="إلغاء التكليف"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-black text-foreground">{props.selectedBroker.name}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">{props.selectedBroker.title}</div>
                </div>
                <BrokerAvatar
                  avatarImage={props.selectedBroker.avatarImage}
                  avatarLabel={props.selectedBroker.avatarLabel}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={props.brokerSearch}
                onChange={(event) => props.setBrokerSearch(event.target.value)}
                placeholder="ابحث باسم الوسيط"
                className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 pr-11 text-base font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card"
              />
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
            {props.filteredBrokers.length > 0 ? (
              <div className="grid gap-2">
                {props.filteredBrokers.map((broker) => (
                  <button
                    key={broker.id}
                    type="button"
                    onClick={() => {
                      props.setSelectedBrokerId(broker.id);
                      props.setBrokerSearch("");
                    }}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-right transition hover:border-foreground/30 hover:bg-card"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-sm font-black text-foreground">{broker.name}</div>
                        <div className="mt-1 text-xs font-semibold text-muted-foreground">{broker.title}</div>
                      </div>
                      <BrokerAvatar avatarImage={broker.avatarImage} avatarLabel={broker.avatarLabel} />
                    </div>
                    <CheckCircle2 className="h-4 w-4 text-stone-300" />
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm font-semibold text-muted-foreground">
                لا توجد نتائج مطابقة حالياً.
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </StepShell>
  );
}

export function ReviewStep(props: {
  formState: AgPropertyFormState;
  savePending: boolean;
  selectedBroker?: BrokerPresence;
  setShowSafetyConfirm: React.Dispatch<React.SetStateAction<boolean>>;
  submitLabel: string;
}) {
  return (
    <StepShell
      badge="الخطوة 6"
      title="راجع الصورة النهائية قبل الحفظ"
      description="هذه المراجعة تجمع أهم ما سيظهر للفريق أو للمستلم حتى تتأكد أن المشروع جاهز للحفظ أو النشر."
      checklist={["البيانات الأساسية مكتملة", "المعرض يعكس قيمة المشروع", "الخصوصية والحالة مضبوطة"]}
    >
      <SectionCard title="ملخص المشروع النهائي" description="تأكد من البيانات الرئيسية قبل تنفيذ الحفظ النهائي.">
        <div className="grid gap-3">
          <ReviewRow label="اسم المشروع" value={props.formState.name || "غير محدد"} />
          <ReviewRow label="السعر" value={props.formState.price || "غير محدد"} />
          <ReviewRow label="الموقع" value={props.formState.location || "غير محدد"} />
          <ReviewRow label="الوصف القصير" value={props.formState.shortDescription || "غير محدد"} />
          <ReviewRow
            label="صور المشروع"
            value={
              props.formState.images.length > 0
                ? `${props.formState.images.length} صورة${props.formState.coverImageKey ? " + غلاف محدد" : ""}`
                : "لا توجد صور"
            }
          />
          <ReviewRow
            label="عرض الصور"
            value={`${GALLERY_DISPLAY_OPTIONS.find((option) => option.value === props.formState.galleryDisplayMode)?.label ?? "ملء الإطار"} / ${GALLERY_ASPECT_OPTIONS.find((option) => option.value === props.formState.galleryAspectRatio)?.label ?? "أفقي"}`}
          />
          <ReviewRow
            label="المواصفات"
            value={`${props.formState.rooms || "0"} غرف • ${props.formState.baths || "0"} حمامات • ${props.formState.area || "0"} م²`}
          />
          <ReviewRow
            label="المواقف"
            value={props.formState.hasParking ? `${props.formState.parkingSpaces || "غير محدد"} موقف` : "غير متوفر"}
          />
          <ReviewRow label="حالة المشروع" value={props.formState.status} />
          <ReviewRow
            label="ظهور العميل"
            value={props.formState.clientVisibility === "public" ? "ظاهر في AI والعميل" : "خاص داخل مساحة العمل"}
          />
          <ReviewRow
            label="المشاهدون المصرح لهم"
            value={props.formState.visibilityMembers.length > 0 ? `${props.formState.visibilityMembers.length} مستخدم` : "لا يوجد"}
          />
          <ReviewRow
            label="الوسيط"
            value={props.selectedBroker ? props.selectedBroker.name : "بدون وسيط محدد"}
          />
          <ReviewRow
            label="التصريح الخاص"
            value={
              props.formState.privatePermitSummary || props.formState.privatePermitFiles.length > 0
                ? "تمت إضافة بيانات خاصة للمحادثة"
                : "لا يوجد"
            }
          />
        </div>
      </SectionCard>

      <section className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-6 text-foreground shadow-sm">
        <div className="flex items-start gap-3 rounded-[18px] border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] p-4 text-right">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <p className="text-sm leading-6 text-[var(--workspace-muted)]">
            راجع الحالة ونوع الظهور والتصريح الخاص قبل الحفظ. هذه العناصر تحدد أين يظهر المشروع ومن يستطيع الوصول إليه.
          </p>
        </div>

        <button
          type="button"
          onClick={() => props.setShowSafetyConfirm(true)}
          disabled={props.savePending}
          className="mt-5 w-full rounded-2xl bg-foreground px-4 py-4 text-base font-black text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {props.savePending ? "جارٍ الحفظ..." : props.submitLabel}
        </button>

        <div className="mt-4 flex items-center gap-2 text-sm text-[var(--workspace-muted)]">
          <Check className="h-4 w-4" />
          سيتم حفظ المشروع وفق البيانات المعروضة هنا مع الحالة ومستوى الوصول المحددين.
        </div>
      </section>
    </StepShell>
  );
}

export function StepNavigation({
  activeStepTitle,
  activeStepSummary,
  currentStepIndex,
  isLastStep,
  setCurrentStepIndex,
}: {
  activeStepTitle: string;
  activeStepSummary: string;
  currentStepIndex: number;
  isLastStep: boolean;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  const completionPercent = ((currentStepIndex + 1) / STEP_DEFINITIONS.length) * 100;

  return (
    <>
      <section className="rounded-[24px] border border-[color:var(--workspace-border)] bg-[var(--workspace-panel)] p-4 lg:p-5">
        <div className="text-right">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-foreground">
                الخطوة {currentStepIndex + 1} من {STEP_DEFINITIONS.length}
              </div>
              <div className="mt-1 text-xl font-black text-foreground">{activeStepTitle}</div>
            </div>
            <div className="rounded-full border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-3 py-1.5 text-[12px] font-bold text-[var(--workspace-muted)]">
              {Math.round(completionPercent)}%
            </div>
          </div>
          <div className="mt-2 text-sm leading-7 text-[var(--workspace-muted)]">{activeStepSummary}</div>
          <div className="mt-4 h-2 rounded-full bg-[color:color-mix(in_srgb,var(--workspace-border)_72%,transparent)]">
            <div
              className="h-full rounded-full bg-[var(--workspace-highlight)] transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap justify-end gap-2">
          {STEP_DEFINITIONS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStepIndex(index)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-[12px] font-bold transition ${
                  isActive
                    ? "border-[color:color-mix(in_srgb,var(--workspace-highlight)_22%,var(--workspace-border))] bg-[color:color-mix(in_srgb,var(--workspace-highlight)_10%,var(--workspace-panel))] text-foreground"
                    : isCompleted
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] text-[var(--workspace-muted)] hover:text-foreground"
                }`}
              >
                <span
                  className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-black ${
                    isActive ? "bg-foreground text-background" : isCompleted ? "bg-emerald-600 text-white" : "bg-[var(--workspace-panel)] text-[var(--workspace-muted)]"
                  }`}
                >
                  {index + 1}
                </span>
                <span>{step.title}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="sticky bottom-4 z-10 rounded-[22px] border border-[color:var(--workspace-border)] bg-[color:color-mix(in_srgb,var(--workspace-panel)_92%,transparent)] p-4 shadow-lg backdrop-blur md:p-5">
        <div className="flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.max(0, current - 1))}
            disabled={currentStepIndex === 0}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[color:var(--workspace-border)] bg-[var(--workspace-elevated)] px-6 py-3 text-[13px] font-black text-foreground transition-all hover:bg-[var(--workspace-accent-soft)] active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            رجوع
          </button>

          <div className="hidden text-sm font-semibold text-[var(--workspace-muted)] lg:block">
            {isLastStep ? "جاهز للحفظ" : `التالي: ${STEP_DEFINITIONS[currentStepIndex + 1]?.title ?? ""}`}
          </div>

          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.min(STEP_DEFINITIONS.length - 1, current + 1))}
            disabled={isLastStep}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-8 py-3 text-[13px] font-black text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            متابعة
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </section>
    </>
  );
}

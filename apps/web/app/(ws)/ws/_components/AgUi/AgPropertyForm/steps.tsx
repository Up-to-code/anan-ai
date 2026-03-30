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
import type { BrokerPresence } from "../Visuals/BrokerPresenceChip";
import { BrokerAvatar, FieldLabel, ReviewRow, SectionCard, TextArea, TextInput, UploadTile } from "./controls";
import { GALLERY_ASPECT_OPTIONS, GALLERY_DISPLAY_OPTIONS, STEP_DEFINITIONS } from "./shared";
import type { AgPropertyFormState } from "./shared";

export function BasicStep({
  formState,
  setFormState,
}: {
  formState: AgPropertyFormState;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  return (
    <SectionCard title="البيانات الأساسية" description="ابدأ باسم المشروع، سعره، وموقعه الرئيسي.">
      <div className="grid gap-5">
        <div className="grid gap-2">
          <FieldLabel>اسم المشروع</FieldLabel>
          <TextInput
            value={formState.name}
            onChange={(value) => setFormState((prev) => ({ ...prev, name: value }))}
            placeholder="مثال: أبراج الياسمين"
            icon={<Building2 className="h-4 w-4" />}
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="grid gap-2">
            <FieldLabel>السعر</FieldLabel>
            <TextInput
              value={formState.price}
              onChange={(value) => setFormState((prev) => ({ ...prev, price: value }))}
              placeholder="مثال: 2,500,000 ر.س"
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel>الموقع</FieldLabel>
            <TextInput
              value={formState.location}
              onChange={(value) => setFormState((prev) => ({ ...prev, location: value }))}
              placeholder="مثال: جدة، أبحر الشمالية"
              icon={<MapPin className="h-4 w-4" />}
            />
          </div>
        </div>

        <div className="grid gap-2">
          <FieldLabel>ظهور العقار في AI والعميل</FieldLabel>
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
              <div className="text-sm font-black">عام للعميل وAI</div>
              <div className="mt-1 text-xs font-semibold">يظهر في client-web والمساعد الرئيسي عند النشر.</div>
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
              <div className="text-sm font-black">خاص داخل مساحة العمل</div>
              <div className="mt-1 text-xs font-semibold">يبقى داخلياً للمطور أو الوسيط ولا يظهر للعميل.</div>
            </button>
          </div>
        </div>
      </div>
    </SectionCard>
  );
}

export function ContentStep({
  formState,
  setFormState,
}: {
  formState: AgPropertyFormState;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="الوصف الكامل" description="اكتب وصفاً واضحاً يفهمه الوسيط أو العميل مباشرة.">
        <TextArea
          rows={8}
          value={formState.description}
          onChange={(value) => setFormState((prev) => ({ ...prev, description: value }))}
          placeholder="اشرح المشروع، نوع الوحدات، الموقع، نقاط القوة، وأي تفاصيل مهمة."
        />
      </SectionCard>

      <SectionCard title="محتوى الصفحة" description="هذا الجزء يظهر بجوار المعرض وفي بطاقات المشروع.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>وصف قصير</FieldLabel>
            <TextArea
              rows={3}
              value={formState.shortDescription}
              onChange={(value) => setFormState((prev) => ({ ...prev, shortDescription: value }))}
              placeholder="ملخص سريع في سطرين أو ثلاثة."
            />
          </div>
          <div className="grid gap-2">
            <FieldLabel>المزايا والخدمات</FieldLabel>
            <TextArea
              rows={4}
              value={formState.amenitiesText}
              onChange={(value) => setFormState((prev) => ({ ...prev, amenitiesText: value }))}
              placeholder="مثال: مواقف خاصة، نادي، مصاعد، حراسة"
            />
            <p className="text-sm text-muted-foreground">افصل بين كل ميزة بفاصلة أو سطر جديد.</p>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

export function GalleryStep(props: {
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
    <div className="space-y-6">
      <SectionCard title="إدارة الصور" description="ارفع الصور ثم اختر صورة الغلاف ورتب الصور بالشكل المناسب.">
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

      <SectionCard title="أسلوب عرض المعرض" description="اختر كيف تُعرض الصور داخل المعرض دون الحاجة إلى أداة قص كاملة.">
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
              {props.formState.video ? "يمكنك إيقافه متى شئت." : "خيار اختياري لإرفاق فيديو قصير."}
            </div>
          </div>
          <Video className={`h-5 w-5 ${props.formState.video ? "text-emerald-300" : "text-muted-foreground"}`} />
        </button>
      </SectionCard>
    </div>
  );
}

export function SpecsStep(props: {
  adLicenseLabel: string;
  adLicenseTone: string;
  formState: AgPropertyFormState;
  handleLicenseFiles: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleLicenseSubmit: () => Promise<void>;
  isLicenseUploading: boolean;
  licenseDocs: Array<{ key: string; name: string }>;
  licenseError: string | null;
  licenseInputRef: React.MutableRefObject<HTMLInputElement | null>;
  licenseSubmitted: boolean;
  licenseSubmitting: boolean;
  propertyId?: string;
  setFormState: React.Dispatch<React.SetStateAction<AgPropertyFormState>>;
  setLicenseDocs: React.Dispatch<React.SetStateAction<Array<{ key: string; name: string }>>>;
}) {
  return (
    <div className="space-y-6">
      <SectionCard title="المواصفات" description="حدد حالة المشروع والمعلومات الأساسية التي تظهر في البطاقات.">
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
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>الحمامات</FieldLabel>
              <TextInput
                type="number"
                value={props.formState.baths}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, baths: value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>المساحة بالمتر</FieldLabel>
              <TextInput
                value={props.formState.area}
                onChange={(value) => props.setFormState((prev) => ({ ...prev, area: value }))}
                placeholder="مثال: 380"
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
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="رخصة الإعلان" description="أدخل رقم الرخصة الآن، وارفع مستندات التوثيق عندما يكون المشروع محفوظاً.">
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
    </div>
  );
}

export function SharingStep(props: {
  brokerSearch: string;
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
    <div className="space-y-6">
      <SectionCard
        title="رؤية المشروع"
        description="حدد إذا كان المشروع عاماً أو خاصاً، وراجع من يملك حق المشاهدة عندما يكون خاصاً."
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
              <div className="mt-1 text-xs opacity-80">لا يظهر إلا للجهات التي يتم السماح لها بالمشاهدة.</div>
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
              <div className="mt-1 text-xs opacity-80">يظهر في قنوات العميل والـ AI حسب حالة النشر.</div>
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

      <SectionCard title="تصريح خاص للمحادثة" description="سيظهر فقط للشخص الذي فُتح له المشروع عبر مشاركة خاصة في المحادثات.">
        <div className="space-y-4">
          <TextArea
            rows={4}
            value={props.formState.privatePermitSummary}
            onChange={(value) => props.setFormState((prev) => ({ ...prev, privatePermitSummary: value }))}
            placeholder="اكتب ملخصاً قصيراً يشرح هذا التصريح أو التخصيص الخاص."
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
        </div>
      </SectionCard>

      <SectionCard title="تكليف وسيط" description="اختياري. يمكنك اختيار وسيط واحد لربط المشروع به من هذه الصفحة.">
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
    </div>
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
    <div className="space-y-6">
      <SectionCard title="المراجعة النهائية" description="راجع أهم البيانات قبل الحفظ النهائي.">
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

      <section className="rounded-[28px] border border-border bg-card p-6 text-foreground shadow-[0_16px_44px_rgba(0,0,0,0.28)]">
        <div className="flex items-start gap-3 rounded-2xl border border-border bg-card/40 p-4 text-right">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
          <p className="text-sm leading-6 text-muted-foreground">
            تم تبسيط هذا النموذج ليتصرف بشكل أنظف في Safari أيضاً: عمود واحد، أزرار واضحة، وصور داخل أطر ثابتة.
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

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4" />
          سيتم حفظ المشروع وفق الحالة المختارة والبيانات الظاهرة أعلاه.
        </div>
      </section>
    </div>
  );
}

export function StepNavigation({
  activeStepSummary,
  currentStepIndex,
  isLastStep,
  setCurrentStepIndex,
}: {
  activeStepSummary: string;
  currentStepIndex: number;
  isLastStep: boolean;
  setCurrentStepIndex: React.Dispatch<React.SetStateAction<number>>;
}) {
  return (
    <>
      <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div className="text-right">
            <div className="text-sm font-black text-foreground">
              الخطوة {currentStepIndex + 1} من {STEP_DEFINITIONS.length}
            </div>
            <div className="mt-1 text-sm text-muted-foreground">{activeStepSummary}</div>
          </div>
          <div className="inline-flex h-12 min-w-12 items-center justify-center rounded-full bg-foreground px-3 text-sm font-black text-background">
            {currentStepIndex + 1}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
          {STEP_DEFINITIONS.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <button
                key={step.key}
                type="button"
                onClick={() => setCurrentStepIndex(index)}
                className={`rounded-xl border px-3 py-3 text-right transition ${
                  isActive
                    ? "border-border-foreground/45 bg-foreground/10 text-foreground"
                    : isCompleted
                      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
                      : "border-border bg-muted/20 text-foreground hover:border-border hover:bg-muted/40"
                }`}
              >
                <div className="text-xs font-black">{step.title}</div>
                <div className={`mt-1 text-[11px] ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                  {step.summary}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-xl shadow-black/[0.02]">
        <div className="flex items-center justify-between gap-6">
          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.max(0, current - 1))}
            disabled={currentStepIndex === 0}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/10 px-8 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-muted active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            السابق
          </button>

          <div className="hidden text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 lg:block">
            {isLastStep ? "المراجعة النهائية" : `التالي: ${STEP_DEFINITIONS[currentStepIndex + 1]?.title ?? ""}`}
          </div>

          <button
            type="button"
            onClick={() => setCurrentStepIndex((current) => Math.min(STEP_DEFINITIONS.length - 1, current + 1))}
            disabled={isLastStep}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-10 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-background shadow-lg shadow-black/10 transition-all hover:opacity-90 active:scale-95 disabled:pointer-events-none disabled:opacity-30"
          >
            التالي
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </section>
    </>
  );
}

"use client";

import { useMemo, useRef, useState, type ChangeEvent } from "react";
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
import { useUploadThing } from "@/lib/uploadthing";
import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
import type { AgPropertyFormState } from "./AgPropertyForm.shared";
import { AgPropertyFormHeaderActions } from "./AgPropertyFormHeaderActions";
import { AgPropertyFormSafetyOverlay } from "./AgPropertyFormSafetyOverlay";
import ZonePageIntro from "../ZoneShell/ZonePageIntro";
import type { BrokerPresence } from "../Visuals/BrokerPresenceChip";

type GalleryDisplayMode = "cover" | "fit";
type GalleryAspectRatio = "auto" | "landscape" | "square" | "portrait";

export type ProjectFormData = {
  name: string;
  price: string;
  location: string;
  description: string;
  shortDescription: string;
  amenitiesText: string;
  hasParking: boolean;
  parkingSpaces: string;
  coverImageKey: string | null;
  galleryDisplayMode: GalleryDisplayMode;
  galleryAspectRatio: GalleryAspectRatio;
  privatePermitSummary: string;
  privatePermitFiles: UploadedFileReference[];
  rooms: string;
  baths: string;
  area: string;
  status: string;
  clientVisibility: "private" | "public";
  images: UploadedFileReference[];
  video: string | null;
  brokerId: string | null;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected" | null;
  visibilityMembers?: PropertyViewerSummary[];
};

type AgPropertyFormProps = {
  propertyId?: string;
  initialData?: Partial<ProjectFormData>;
  brokers?: BrokerPresence[];
  title?: string;
  description?: string;
  submitLabel?: string;
  onSave?: (data: ProjectFormData) => Promise<void> | void;
  onCancel?: () => void;
  onDelete?: () => void;
  onRevokeViewer?: (viewerAuthUserId: string) => Promise<void> | void;
};

type StepDefinition = {
  key: string;
  title: string;
  summary: string;
};

const LICENSE_STATUS_UI = {
  approved: { label: "معتمد", tone: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30" },
  rejected: { label: "مرفوض", tone: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30" },
  pending: { label: "قيد المراجعة", tone: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30" },
  default: { label: "غير مكتمل", tone: "text-muted-foreground bg-muted/20 border-border" },
} as const;

const STEP_DEFINITIONS: StepDefinition[] = [
  { key: "basic", title: "البيانات الأساسية", summary: "اسم المشروع والسعر والموقع" },
  { key: "content", title: "الوصف والمحتوى", summary: "الوصف الكامل والوصف القصير والمزايا" },
  { key: "gallery", title: "المعرض والصور", summary: "الرفع والترتيب وصورة الغلاف" },
  { key: "specs", title: "المواصفات والترخيص", summary: "الغرف والحالة والمواقف والرخصة" },
  { key: "sharing", title: "المشاركة الخاصة", summary: "التصريح الخاص وتكليف الوسيط" },
  { key: "review", title: "المراجعة والحفظ", summary: "مراجعة نهائية قبل الحفظ" },
];

const GALLERY_DISPLAY_OPTIONS: Array<{ value: GalleryDisplayMode; label: string }> = [
  { value: "cover", label: "ملء الإطار" },
  { value: "fit", label: "إظهار الصورة كاملة" },
];

const GALLERY_ASPECT_OPTIONS: Array<{ value: GalleryAspectRatio; label: string }> = [
  { value: "auto", label: "تلقائي" },
  { value: "landscape", label: "أفقي" },
  { value: "square", label: "مربع" },
  { value: "portrait", label: "عمودي" },
];

const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const PDF_MIME_TYPE = "application/pdf";
const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

function validateUploadSelection(files: File[], mode: "image-only" | "image-or-pdf") {
  for (const file of files) {
    const isImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type);
    const isPdf = file.type === PDF_MIME_TYPE;

    if (mode === "image-only" && !isImage) {
      return "يسمح فقط برفع صور JPG أو PNG أو WEBP.";
    }

    if (mode === "image-or-pdf" && !isImage && !isPdf) {
      return "يسمح فقط برفع صور JPG أو PNG أو WEBP أو ملفات PDF.";
    }

    if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
      return "الحد الأقصى لحجم الصورة هو 8MB.";
    }

    if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
      return "الحد الأقصى لحجم ملف PDF هو 20MB.";
    }
  }

  return null;
}

function resolveLicenseStatusUi(status: "pending" | "approved" | "rejected" | null) {
  if (!status) return LICENSE_STATUS_UI.default;
  return LICENSE_STATUS_UI[status];
}

function resolveInitialCoverImageKey(initialData?: Partial<ProjectFormData>) {
  return initialData?.coverImageKey ?? initialData?.images?.[0]?.key ?? null;
}

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  if (toIndex < 0 || toIndex >= items.length) {
    return items;
  }

  const nextItems = [...items];
  const [item] = nextItems.splice(fromIndex, 1);
  if (!item) {
    return items;
  }
  nextItems.splice(toIndex, 0, item);
  return nextItems;
}

function getGalleryAspectClass(aspectRatio: GalleryAspectRatio) {
  if (aspectRatio === "square") return "aspect-square";
  if (aspectRatio === "portrait") return "aspect-[3/4]";
  if (aspectRatio === "landscape") return "aspect-video";
  return "aspect-[4/3]";
}

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
    <section className="rounded-3xl border border-border bg-card p-6 md:p-10 shadow-xl shadow-black/[0.02] transition-all">
      <div className="mb-8 border-b border-border/40 pb-6 text-right">
        <h3 className="text-xl font-black tracking-tight text-foreground">{title}</h3>
        {description ? <p className="mt-2 text-[14px] font-medium leading-relaxed text-muted-foreground/70">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="mb-2.5 block text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">{children}</label>;
}

function TextInput({
  value,
  onChange,
  placeholder,
  icon,
  type = "text",
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon?: React.ReactNode;
  type?: "text" | "number";
  disabled?: boolean;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="h-14 w-full rounded-2xl border border-border/40 bg-muted/10 px-5 text-[15px] font-bold text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-50"
      />
      {icon ? <div className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30">{icon}</div> : null}
    </div>
  );
}

function TextArea({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full resize-none rounded-2xl border border-border/40 bg-muted/10 px-5 py-4 text-[15px] font-medium leading-[1.6] text-foreground outline-none transition-all placeholder:text-muted-foreground/40 focus:border-foreground/20 focus:bg-muted/20"
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
      className="group flex w-full items-center justify-between gap-3 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 px-4 py-6 text-right transition hover:border-border hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <div className="text-right">
        <div className="text-[13px] font-bold text-foreground">{title}</div>
        {subtitle ? <div className="mt-1 text-[11px] font-bold text-muted-foreground">{subtitle}</div> : null}
      </div>
      <div className="text-muted-foreground transition-colors group-hover:text-foreground">{icon}</div>
    </button>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3 transition-colors shadow-sm">
      <div className="text-[13px] font-bold text-foreground">{value}</div>
      <div className="text-[11px] font-bold tracking-wider uppercase text-muted-foreground">{label}</div>
    </div>
  );
}

function BrokerAvatar({
  avatarImage,
  avatarLabel,
}: {
  avatarImage?: string | null;
  avatarLabel: string;
}) {
  return (
    <div className="h-10 w-10 overflow-hidden rounded-full border border-border bg-card shadow-sm">
      {avatarImage ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={avatarImage} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[12px] font-bold text-muted-foreground bg-background">
          {avatarLabel}
        </div>
      )}
    </div>
  );
}

/**
 * WHY:   Project create and edit need one simplified, Safari-safe flow instead of long split-column forms.
 * WHAT:  Renders a six-step one-column wizard for project data, media, sharing, and final review.
 * HOW:   Keeps all form state local, persists gallery presentation metadata, and only surfaces the save action on the review step.
 */
export default function AgPropertyForm({
  propertyId,
  initialData,
  brokers = [],
  title = "إدارة المشروع",
  description = "أنشئ صفحة مشروع واضحة وسهلة التحديث مع صور، وصف، ومعلومات المشاركة الخاصة.",
  submitLabel = "حفظ المشروع",
  onSave,
  onCancel,
  onDelete,
  onRevokeViewer,
}: AgPropertyFormProps) {
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(initialData?.brokerId ?? null);
  const [brokerSearch, setBrokerSearch] = useState("");
  const [showSafetyConfirm, setShowSafetyConfirm] = useState(false);
  const [savePending, setSavePending] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const licenseInputRef = useRef<HTMLInputElement | null>(null);
  const permitInputRef = useRef<HTMLInputElement | null>(null);
  const { startUpload, isUploading } = useUploadThing("propertyMedia");
  const { startUpload: startLicenseUpload, isUploading: isLicenseUploading } =
    useUploadThing("verificationDocuments");

  const [formState, setFormState] = useState<AgPropertyFormState>({
    name: initialData?.name ?? "",
    price: initialData?.price ?? "",
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    amenitiesText: initialData?.amenitiesText ?? "",
    hasParking: initialData?.hasParking ?? false,
    parkingSpaces: initialData?.parkingSpaces ?? "",
    coverImageKey: resolveInitialCoverImageKey(initialData),
    galleryDisplayMode: initialData?.galleryDisplayMode ?? "cover",
    galleryAspectRatio: initialData?.galleryAspectRatio ?? "landscape",
    privatePermitSummary: initialData?.privatePermitSummary ?? "",
    privatePermitFiles: initialData?.privatePermitFiles ?? [],
    rooms: initialData?.rooms ?? "",
    baths: initialData?.baths ?? "",
    area: initialData?.area ?? "",
    status: initialData?.status ?? "active",
    clientVisibility: initialData?.clientVisibility ?? "private",
    images: initialData?.images ?? [],
    video: initialData?.video ?? null,
    adLicenseNumber: initialData?.adLicenseNumber ?? "",
    visibilityMembers: initialData?.visibilityMembers ?? [],
  });
  const adLicenseStatus = initialData?.adLicenseStatus ?? null;
  const [licenseDocs, setLicenseDocs] = useState<UploadedFileReference[]>([]);
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [licenseSubmitting, setLicenseSubmitting] = useState(false);
  const [licenseSubmitted, setLicenseSubmitted] = useState(false);

  const isEditMode = Boolean(initialData);
  const adLicenseUi = resolveLicenseStatusUi(adLicenseStatus);
  const adLicenseLabel = adLicenseUi.label;
  const adLicenseTone = adLicenseUi.tone;
  const selectedBroker = useMemo(
    () => brokers.find((broker) => broker.id === selectedBrokerId),
    [brokers, selectedBrokerId],
  );
  const filteredBrokers = useMemo(() => {
    const normalizedSearch = brokerSearch.trim().toLowerCase();
    if (!normalizedSearch) {
      return brokers.slice(0, 6);
    }

    return brokers.filter(
      (broker) =>
        broker.name.toLowerCase().includes(normalizedSearch) ||
        broker.title?.toLowerCase().includes(normalizedSearch),
    );
  }, [brokerSearch, brokers]);

  const activeStep = STEP_DEFINITIONS[currentStepIndex];
  const isLastStep = currentStepIndex === STEP_DEFINITIONS.length - 1;
  const previewAspectClass = getGalleryAspectClass(formState.galleryAspectRatio);
  const previewObjectClass = formState.galleryDisplayMode === "fit" ? "object-contain" : "object-cover";

  const setCoverImageKey = (nextCoverImageKey: string | null) => {
    setFormState((prev) => ({
      ...prev,
      coverImageKey: nextCoverImageKey ?? prev.images[0]?.key ?? null,
    }));
  };

  const removeImage = (index: number) => {
    setFormState((prev) => {
      const removedImage = prev.images[index];
      const nextImages = prev.images.filter((_, imageIndex) => imageIndex !== index);
      const nextCoverImageKey =
        removedImage?.key === prev.coverImageKey ? nextImages[0]?.key ?? null : prev.coverImageKey;

      return {
        ...prev,
        images: nextImages,
        coverImageKey: nextCoverImageKey,
      };
    });
  };

  const moveImage = (fromIndex: number, offset: -1 | 1) => {
    setFormState((prev) => ({
      ...prev,
      images: moveItem(prev.images, fromIndex, fromIndex + offset),
    }));
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }

    setUploadError(null);
    const validationError = validateUploadSelection(files, "image-only");
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startUpload(files);
      const nextImages = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setFormState((prev) => {
        const mergedImages = [...prev.images, ...nextImages];
        return {
          ...prev,
          images: mergedImages,
          coverImageKey: prev.coverImageKey ?? mergedImages[0]?.key ?? null,
        };
      });
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع الصور حالياً.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    setLicenseError(null);
    setLicenseSubmitted(false);
    const validationError = validateUploadSelection(files, "image-or-pdf");
    if (validationError) {
      setLicenseError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startLicenseUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setLicenseDocs((current) => [...current, ...nextDocs]);
    } catch (error) {
      setLicenseError(error instanceof Error ? error.message : "تعذر رفع مستندات الترخيص.");
    } finally {
      event.target.value = "";
    }
  };

  const handlePermitFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (files.length === 0) {
      return;
    }
    const validationError = validateUploadSelection(files, "image-or-pdf");
    if (validationError) {
      setUploadError(validationError);
      event.target.value = "";
      return;
    }

    try {
      const uploaded = await startLicenseUpload(files);
      const nextDocs = uploaded?.map((file) => file.serverData as UploadedFileReference) ?? [];
      setFormState((prev) => ({
        ...prev,
        privatePermitFiles: [...prev.privatePermitFiles, ...nextDocs],
      }));
      setUploadError(null);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "تعذر رفع ملفات التصريح الخاص.");
    } finally {
      event.target.value = "";
    }
  };

  const handleLicenseSubmit = async () => {
    if (!propertyId) {
      setLicenseError("الرجاء حفظ المشروع أولاً ثم إرسال طلب الترخيص.");
      return;
    }
    if (!formState.adLicenseNumber.trim()) {
      setLicenseError("الرجاء إدخال رقم رخصة الإعلان العقاري.");
      return;
    }
    if (licenseDocs.length === 0) {
      setLicenseError("الرجاء رفع مستند واحد على الأقل لإرسال الطلب.");
      return;
    }

    setLicenseSubmitting(true);
    setLicenseError(null);
    setLicenseSubmitted(false);

    try {
      const response = await fetch("/api/property-verification-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          adLicenseNumber: formState.adLicenseNumber.trim(),
          documents: licenseDocs,
        }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => null);
        throw new Error(payload?.message ?? "تعذر إرسال الطلب.");
      }
      setLicenseSubmitted(true);
    } catch (error) {
      setLicenseError(error instanceof Error ? error.message : "تعذر إرسال الطلب.");
    } finally {
      setLicenseSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    const payload: ProjectFormData = {
      ...formState,
      brokerId: selectedBrokerId,
      adLicenseStatus,
      visibilityMembers: formState.visibilityMembers,
    };
    setSavePending(true);
    try {
      if (onSave) {
        await onSave(payload);
      }
      setShowSafetyConfirm(false);
    } finally {
      setSavePending(false);
    }
  };

  const renderBasicStep = () => (
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

  const renderContentStep = () => (
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

  const renderGalleryStep = () => (
    <div className="space-y-6">
      <SectionCard title="إدارة الصور" description="ارفع الصور ثم اختر صورة الغلاف ورتب الصور بالشكل المناسب.">
        <div className="space-y-4">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(event) => void handleImageSelection(event)}
          />
          <UploadTile
            title={isUploading ? "جارٍ رفع الصور..." : "إضافة صور المشروع"}
            subtitle={`${formState.images.length} صورة مرفوعة`}
            onClick={() => inputRef.current?.click()}
            icon={<ImagePlus className="h-5 w-5" />}
            disabled={isUploading}
          />

          {uploadError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
              {uploadError}
            </div>
          ) : null}

          {formState.images.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {formState.images.map((image, index) => {
                const isCover = formState.coverImageKey === image.key;
                return (
                  <div key={`${image.key}-${index}`} className="rounded-xl border border-border bg-card p-3">
                    <div className={["overflow-hidden rounded-lg border border-border bg-muted/20", previewAspectClass].join(" ")}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.url}
                        alt={image.name}
                        className={`h-full w-full ${previewObjectClass}`}
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
                        onClick={() => setCoverImageKey(image.key)}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30"
                      >
                        غلاف
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, -1)}
                        disabled={index === 0}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        رفع
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, 1)}
                        disabled={index === formState.images.length - 1}
                        className="rounded-md border border-border bg-muted/20 px-3 py-2 text-xs font-bold text-foreground transition hover:border-foreground/30 disabled:opacity-40"
                      >
                        خفض
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
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
              value={formState.galleryDisplayMode}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  galleryDisplayMode: event.target.value as GalleryDisplayMode,
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
              value={formState.galleryAspectRatio}
              onChange={(event) =>
                setFormState((prev) => ({
                  ...prev,
                  galleryAspectRatio: event.target.value as GalleryAspectRatio,
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
          onClick={() => setFormState((prev) => ({ ...prev, video: prev.video ? null : "mock-video.mp4" }))}
          className="mt-5 flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-right transition hover:border-stone-400"
        >
          <div className="text-right">
            <div className="text-sm font-black text-foreground">
              {formState.video ? "الفيديو مفعّل" : "تفعيل فيديو توضيحي"}
            </div>
            <div className="mt-1 text-xs font-semibold text-muted-foreground">
              {formState.video ? "يمكنك إيقافه متى شئت." : "خيار اختياري لإرفاق فيديو قصير."}
            </div>
          </div>
          <Video className={`h-5 w-5 ${formState.video ? "text-emerald-300" : "text-muted-foreground"}`} />
        </button>
      </SectionCard>
    </div>
  );

  const renderSpecsStep = () => (
    <div className="space-y-6">
      <SectionCard title="المواصفات" description="حدد حالة المشروع والمعلومات الأساسية التي تظهر في البطاقات.">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <FieldLabel>حالة المشروع</FieldLabel>
            <select
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
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
                value={formState.rooms}
                onChange={(value) => setFormState((prev) => ({ ...prev, rooms: value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>الحمامات</FieldLabel>
              <TextInput
                type="number"
                value={formState.baths}
                onChange={(value) => setFormState((prev) => ({ ...prev, baths: value }))}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <FieldLabel>المساحة بالمتر</FieldLabel>
              <TextInput
                value={formState.area}
                onChange={(value) => setFormState((prev) => ({ ...prev, area: value }))}
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
            <TextInput
              type="number"
              value={formState.parkingSpaces}
              onChange={(value) => setFormState((prev) => ({ ...prev, parkingSpaces: value }))}
              placeholder="عدد المواقف"
              disabled={!formState.hasParking}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="رخصة الإعلان" description="أدخل رقم الرخصة الآن، وارفع مستندات التوثيق عندما يكون المشروع محفوظاً.">
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="text-sm font-black text-foreground">حالة التوثيق</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${adLicenseTone}`}>
                {adLicenseLabel}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">ستبقى هذه الحالة محدثة عند إرسال أو مراجعة الطلب.</p>
          </div>

          <div className="grid gap-2">
            <FieldLabel>رقم رخصة الإعلان</FieldLabel>
            <TextInput
              value={formState.adLicenseNumber}
              onChange={(value) => setFormState((prev) => ({ ...prev, adLicenseNumber: value }))}
              placeholder="مثال: AD-12345"
            />
          </div>

          {propertyId ? (
            <>
              <input
                ref={licenseInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(event) => void handleLicenseFiles(event)}
              />
              <UploadTile
                title={isLicenseUploading ? "جارٍ رفع المستندات..." : "رفع مستندات الرخصة"}
                subtitle={licenseDocs.length > 0 ? `${licenseDocs.length} ملف` : "PDF أو صور واضحة"}
                onClick={() => licenseInputRef.current?.click()}
                icon={<Upload className="h-5 w-5" />}
                disabled={isLicenseUploading}
              />

              {licenseDocs.length > 0 ? (
                <div className="space-y-2">
                  {licenseDocs.map((doc) => (
                    <div key={doc.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setLicenseDocs((current) => current.filter((item) => item.key !== doc.key))}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="truncate text-sm font-bold text-foreground">{doc.name}</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {licenseError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                  {licenseError}
                </div>
              ) : null}
              {licenseSubmitted ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  تم إرسال طلب التوثيق بنجاح.
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => void handleLicenseSubmit()}
                disabled={licenseSubmitting}
                className="w-full rounded-2xl border border-foreground/50 bg-foreground px-4 py-3 text-sm font-bold text-background transition hover:brightness-110 disabled:opacity-60"
              >
                {licenseSubmitting ? "جارٍ الإرسال..." : "إرسال طلب التوثيق"}
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

  const renderSharingStep = () => (
    <div className="space-y-6">
      <SectionCard
        title="رؤية المشروع"
        description="حدد إذا كان المشروع عاماً أو خاصاً، وراجع من يملك حق المشاهدة عندما يكون خاصاً."
      >
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "private" }))}
              className={`rounded-2xl border px-4 py-4 text-right transition ${
                formState.clientVisibility === "private"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">خاص</div>
              <div className="mt-1 text-xs opacity-80">لا يظهر إلا للجهات التي يتم السماح لها بالمشاهدة.</div>
            </button>
            <button
              type="button"
              onClick={() => setFormState((prev) => ({ ...prev, clientVisibility: "public" }))}
              className={`rounded-2xl border px-4 py-4 text-right transition ${
                formState.clientVisibility === "public"
                  ? "border-foreground/20 bg-foreground text-background"
                  : "border-border bg-background text-foreground hover:bg-muted"
              }`}
            >
              <div className="text-sm font-black">عام</div>
              <div className="mt-1 text-xs opacity-80">يظهر في قنوات العميل والـ AI حسب حالة النشر.</div>
            </button>
          </div>

          {formState.clientVisibility === "private" ? (
            <div className="space-y-3">
              {formState.visibilityMembers.length > 0 ? (
                formState.visibilityMembers.map((viewer) => (
                  <div
                    key={viewer.authUserId}
                    className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <button
                      type="button"
                      disabled={!onRevokeViewer}
                      onClick={() => {
                        if (!onRevokeViewer) return;
                        void Promise.resolve(onRevokeViewer(viewer.authUserId)).then(() => {
                          setFormState((prev) => ({
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
            value={formState.privatePermitSummary}
            onChange={(value) => setFormState((prev) => ({ ...prev, privatePermitSummary: value }))}
            placeholder="اكتب ملخصاً قصيراً يشرح هذا التصريح أو التخصيص الخاص."
          />

          <input
            ref={permitInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(event) => void handlePermitFiles(event)}
          />
          <UploadTile
            title="رفع ملفات التصريح الخاص"
            subtitle={
              formState.privatePermitFiles.length > 0
                ? `${formState.privatePermitFiles.length} ملف`
                : "لن يراها إلا الطرف المصرح له"
            }
            onClick={() => permitInputRef.current?.click()}
            icon={<FileCheck2 className="h-5 w-5" />}
          />

          {formState.privatePermitFiles.length > 0 ? (
            <div className="space-y-2">
              {formState.privatePermitFiles.map((doc) => (
                <div key={doc.key} className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-muted/20 px-4 py-3">
                  <button
                    type="button"
                    onClick={() =>
                      setFormState((prev) => ({
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
        {selectedBroker ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-4">
            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedBrokerId(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground"
                title="إلغاء التكليف"
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-sm font-black text-foreground">{selectedBroker.name}</div>
                  <div className="mt-1 text-xs font-semibold text-muted-foreground">{selectedBroker.title}</div>
                </div>
                <BrokerAvatar
                  avatarImage={selectedBroker.avatarImage}
                  avatarLabel={selectedBroker.avatarLabel}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={brokerSearch}
                onChange={(event) => setBrokerSearch(event.target.value)}
                placeholder="ابحث باسم الوسيط"
                className="min-h-[54px] w-full rounded-2xl border border-border bg-muted/20 px-4 py-3 pr-11 text-base font-semibold text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:bg-card"
              />
              <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            </div>
            {filteredBrokers.length > 0 ? (
              <div className="grid gap-2">
                {filteredBrokers.map((broker) => (
                  <button
                    key={broker.id}
                    type="button"
                    onClick={() => {
                      setSelectedBrokerId(broker.id);
                      setBrokerSearch("");
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

  const renderReviewStep = () => (
    <div className="space-y-6">
      <SectionCard title="المراجعة النهائية" description="راجع أهم البيانات قبل الحفظ النهائي.">
        <div className="grid gap-3">
          <ReviewRow label="اسم المشروع" value={formState.name || "غير محدد"} />
          <ReviewRow label="السعر" value={formState.price || "غير محدد"} />
          <ReviewRow label="الموقع" value={formState.location || "غير محدد"} />
          <ReviewRow label="الوصف القصير" value={formState.shortDescription || "غير محدد"} />
          <ReviewRow
            label="صور المشروع"
            value={
              formState.images.length > 0
                ? `${formState.images.length} صورة${formState.coverImageKey ? " + غلاف محدد" : ""}`
                : "لا توجد صور"
            }
          />
          <ReviewRow
            label="عرض الصور"
            value={`${GALLERY_DISPLAY_OPTIONS.find((option) => option.value === formState.galleryDisplayMode)?.label ?? "ملء الإطار"} / ${GALLERY_ASPECT_OPTIONS.find((option) => option.value === formState.galleryAspectRatio)?.label ?? "أفقي"}`}
          />
          <ReviewRow
            label="المواصفات"
            value={`${formState.rooms || "0"} غرف • ${formState.baths || "0"} حمامات • ${formState.area || "0"} م²`}
          />
          <ReviewRow
            label="المواقف"
            value={formState.hasParking ? `${formState.parkingSpaces || "غير محدد"} موقف` : "غير متوفر"}
          />
          <ReviewRow label="حالة المشروع" value={formState.status} />
          <ReviewRow
            label="ظهور العميل"
            value={formState.clientVisibility === "public" ? "ظاهر في AI والعميل" : "خاص داخل مساحة العمل"}
          />
          <ReviewRow
            label="المشاهدون المصرح لهم"
            value={formState.visibilityMembers.length > 0 ? `${formState.visibilityMembers.length} مستخدم` : "لا يوجد"}
          />
          <ReviewRow
            label="الوسيط"
            value={selectedBroker ? selectedBroker.name : "بدون وسيط محدد"}
          />
          <ReviewRow
            label="التصريح الخاص"
            value={
              formState.privatePermitSummary || formState.privatePermitFiles.length > 0
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
          onClick={() => setShowSafetyConfirm(true)}
          disabled={savePending}
          className="mt-5 w-full rounded-2xl bg-foreground px-4 py-4 text-base font-black text-background transition hover:brightness-110 disabled:opacity-60"
        >
          {savePending ? "جارٍ الحفظ..." : submitLabel}
        </button>

        <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Check className="h-4 w-4" />
          سيتم حفظ المشروع وفق الحالة المختارة والبيانات الظاهرة أعلاه.
        </div>
      </section>
    </div>
  );

  const renderCurrentStep = () => {
    if (activeStep.key === "basic") return renderBasicStep();
    if (activeStep.key === "content") return renderContentStep();
    if (activeStep.key === "gallery") return renderGalleryStep();
    if (activeStep.key === "specs") return renderSpecsStep();
    if (activeStep.key === "sharing") return renderSharingStep();
    return renderReviewStep();
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col pb-12">
      {showSafetyConfirm ? (
        <AgPropertyFormSafetyOverlay
          savePending={savePending}
          onConfirm={handleConfirm}
          onClose={() => setShowSafetyConfirm(false)}
        />
      ) : null}

      <ZonePageIntro
        eyebrow={isEditMode ? "تعديل المشروع" : "إنشاء مشروع جديد"}
        title={title}
        description={description}
        actions={isEditMode ? <AgPropertyFormHeaderActions onCancel={onCancel} onDelete={onDelete} /> : undefined}
      />

      <div className="space-y-6 px-1 py-4 lg:py-6">
        <section className="rounded-[28px] border border-border bg-card p-5 shadow-[0_12px_40px_rgba(0,0,0,0.2)] sm:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div className="text-right">
              <div className="text-sm font-black text-foreground">
                الخطوة {currentStepIndex + 1} من {STEP_DEFINITIONS.length}
              </div>
              <div className="mt-1 text-sm text-muted-foreground">{activeStep.summary}</div>
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

        {renderCurrentStep()}

        <section className="rounded-3xl border border-border bg-card p-4 md:p-6 shadow-xl shadow-black/[0.02]">
          <div className="flex items-center justify-between gap-6">
            <button
              type="button"
              onClick={() => setCurrentStepIndex((current) => Math.max(0, current - 1))}
              disabled={currentStepIndex === 0}
              className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-muted/10 px-8 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none"
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
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-10 py-4 text-[13px] font-black uppercase tracking-[0.2em] text-background transition-all hover:opacity-90 active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-lg shadow-black/10"
            >
              التالي
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
import type { AppLocale } from "@/lib/locale";
import type { GalleryAspectRatio, GalleryDisplayMode, ProjectFormData, StepDefinition } from "./types";

export type AgPropertyFormState = {
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
  adLicenseNumber: string;
  visibilityMembers: PropertyViewerSummary[];
};

const LICENSE_STATUS_LABELS: Record<
  AppLocale,
  { approved: string; rejected: string; pending: string; default: string }
> = {
  ar: {
    approved: "معتمد",
    rejected: "مرفوض",
    pending: "قيد المراجعة",
    default: "غير مكتمل",
  },
  en: {
    approved: "Approved",
    rejected: "Rejected",
    pending: "Under review",
    default: "Incomplete",
  },
  fr: {
    approved: "Approuve",
    rejected: "Refuse",
    pending: "En revision",
    default: "Incomplet",
  },
};

export function getLicenseStatusUi(locale: AppLocale) {
  const labels = LICENSE_STATUS_LABELS[locale];
  return {
    approved: { label: labels.approved, tone: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30" },
    rejected: { label: labels.rejected, tone: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30" },
    pending: { label: labels.pending, tone: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30" },
    default: { label: labels.default, tone: "text-muted-foreground bg-muted/20 border-border" },
  } as const;
}

export function getStepDefinitions(locale: AppLocale): StepDefinition[] {
  if (locale === "en") {
    return [
      { key: "basic", title: "Basics", summary: "Project name, price, and location" },
      { key: "content", title: "Content", summary: "Full description, short copy, and highlights" },
      { key: "gallery", title: "Gallery", summary: "Uploads, ordering, and cover image" },
      { key: "specs", title: "Specs", summary: "Rooms, status, parking, and license" },
      { key: "sharing", title: "Sharing", summary: "Private access, permit files, and broker link" },
      { key: "review", title: "Review", summary: "Final review before saving" },
    ];
  }

  if (locale === "fr") {
    return [
      { key: "basic", title: "Base", summary: "Nom du projet, prix et emplacement" },
      { key: "content", title: "Contenu", summary: "Description complete, resume et points forts" },
      { key: "gallery", title: "Galerie", summary: "Televersements, ordre et image de couverture" },
      { key: "specs", title: "Details", summary: "Pieces, statut, parking et licence" },
      { key: "sharing", title: "Partage", summary: "Acces prive, fichiers et courtier" },
      { key: "review", title: "Revision", summary: "Revision finale avant l'enregistrement" },
    ];
  }

  return [
    { key: "basic", title: "البيانات الأساسية", summary: "اسم المشروع والسعر والموقع" },
    { key: "content", title: "الوصف والمحتوى", summary: "الوصف الكامل والوصف القصير والمزايا" },
    { key: "gallery", title: "المعرض والصور", summary: "الرفع والترتيب وصورة الغلاف" },
    { key: "specs", title: "المواصفات والترخيص", summary: "الغرف والحالة والمواقف والرخصة" },
    { key: "sharing", title: "المشاركة الخاصة", summary: "التصريح الخاص وتكليف الوسيط" },
    { key: "review", title: "المراجعة والحفظ", summary: "مراجعة نهائية قبل الحفظ" },
  ];
}

export function getGalleryDisplayOptions(locale: AppLocale): Array<{ value: GalleryDisplayMode; label: string }> {
  if (locale === "en") {
    return [
      { value: "cover", label: "Fill frame" },
      { value: "fit", label: "Show full image" },
    ];
  }

  if (locale === "fr") {
    return [
      { value: "cover", label: "Remplir le cadre" },
      { value: "fit", label: "Afficher l'image complete" },
    ];
  }

  return [
    { value: "cover", label: "ملء الإطار" },
    { value: "fit", label: "إظهار الصورة كاملة" },
  ];
}

export function getGalleryAspectOptions(locale: AppLocale): Array<{ value: GalleryAspectRatio; label: string }> {
  if (locale === "en") {
    return [
      { value: "auto", label: "Automatic" },
      { value: "landscape", label: "Landscape" },
      { value: "square", label: "Square" },
      { value: "portrait", label: "Portrait" },
    ];
  }

  if (locale === "fr") {
    return [
      { value: "auto", label: "Automatique" },
      { value: "landscape", label: "Paysage" },
      { value: "square", label: "Carre" },
      { value: "portrait", label: "Portrait" },
    ];
  }

  return [
    { value: "auto", label: "تلقائي" },
    { value: "landscape", label: "أفقي" },
    { value: "square", label: "مربع" },
    { value: "portrait", label: "عمودي" },
  ];
}

export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const PDF_MIME_TYPE = "application/pdf";
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

export function createInitialFormState(initialData?: Partial<ProjectFormData>, coverImageKey?: string | null): AgPropertyFormState {
  return {
    name: initialData?.name ?? "",
    price: initialData?.price ?? "",
    location: initialData?.location ?? "",
    description: initialData?.description ?? "",
    shortDescription: initialData?.shortDescription ?? "",
    amenitiesText: initialData?.amenitiesText ?? "",
    hasParking: initialData?.hasParking ?? false,
    parkingSpaces: initialData?.parkingSpaces ?? "",
    coverImageKey: coverImageKey ?? null,
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
  };
}

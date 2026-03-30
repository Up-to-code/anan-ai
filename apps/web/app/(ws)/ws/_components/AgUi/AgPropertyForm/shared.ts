import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
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

export const LICENSE_STATUS_UI = {
  approved: { label: "معتمد", tone: "text-emerald-700 bg-emerald-50 border-emerald-200 dark:text-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/30" },
  rejected: { label: "مرفوض", tone: "text-rose-700 bg-rose-50 border-rose-200 dark:text-rose-300 dark:bg-rose-500/10 dark:border-rose-500/30" },
  pending: { label: "قيد المراجعة", tone: "text-amber-700 bg-amber-50 border-amber-200 dark:text-amber-300 dark:bg-amber-500/10 dark:border-amber-500/30" },
  default: { label: "غير مكتمل", tone: "text-muted-foreground bg-muted/20 border-border" },
} as const;

export const STEP_DEFINITIONS: StepDefinition[] = [
  { key: "basic", title: "البيانات الأساسية", summary: "اسم المشروع والسعر والموقع" },
  { key: "content", title: "الوصف والمحتوى", summary: "الوصف الكامل والوصف القصير والمزايا" },
  { key: "gallery", title: "المعرض والصور", summary: "الرفع والترتيب وصورة الغلاف" },
  { key: "specs", title: "المواصفات والترخيص", summary: "الغرف والحالة والمواقف والرخصة" },
  { key: "sharing", title: "المشاركة الخاصة", summary: "التصريح الخاص وتكليف الوسيط" },
  { key: "review", title: "المراجعة والحفظ", summary: "مراجعة نهائية قبل الحفظ" },
];

export const GALLERY_DISPLAY_OPTIONS: Array<{ value: GalleryDisplayMode; label: string }> = [
  { value: "cover", label: "ملء الإطار" },
  { value: "fit", label: "إظهار الصورة كاملة" },
];

export const GALLERY_ASPECT_OPTIONS: Array<{ value: GalleryAspectRatio; label: string }> = [
  { value: "auto", label: "تلقائي" },
  { value: "landscape", label: "أفقي" },
  { value: "square", label: "مربع" },
  { value: "portrait", label: "عمودي" },
];

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

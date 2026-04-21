import type { UploadedFileReference } from "@/server/contracts/files";
import type { PropertyViewerSummary } from "@/server/contracts/properties";
import type { AppLocale } from "@/lib/locale";
import type {
  GalleryAspectRatio,
  GalleryDisplayMode,
  ProjectBrokerAuthorizationFormData,
  ProjectComplianceDocumentFormData,
  ProjectDossierFormData,
  ProjectFormData,
  ProjectPaymentPlanFormData,
  ProjectUnitFormData,
  StepDefinition,
} from "./types";

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
  dossier: ProjectDossierFormData;
  units: ProjectUnitFormData[];
  paymentPlans: ProjectPaymentPlanFormData[];
  complianceDocuments: ProjectComplianceDocumentFormData[];
  brokerAuthorization: ProjectBrokerAuthorizationFormData;
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
      { key: "basic", title: "Identity", summary: "Project name and structured Saudi location" },
      { key: "sharing", title: "Ownership", summary: "Owner, authorization, and distribution scope" },
      { key: "specs", title: "Units", summary: "Unit inventory, size, rooms, and availability" },
      { key: "payment", title: "Payment", summary: "Starting price, payment plan, and finance notes" },
      { key: "compliance", title: "Compliance", summary: "Ad license, WAFI evidence, and legal files" },
      { key: "gallery", title: "Media", summary: "Uploads, ordering, cover image, and presentation" },
      { key: "review", title: "Readiness", summary: "Blockers and publish request review" },
    ];
  }

  if (locale === "fr") {
    return [
      { key: "basic", title: "Identite", summary: "Nom du projet et adresse saoudienne structuree" },
      { key: "sharing", title: "Propriete", summary: "Proprietaire, autorisation et portee marketing" },
      { key: "specs", title: "Unites", summary: "Inventaire, surfaces, pieces et disponibilite" },
      { key: "payment", title: "Paiement", summary: "Prix, plan de paiement et notes finance" },
      { key: "compliance", title: "Conformite", summary: "Licence publicitaire, WAFI et documents" },
      { key: "gallery", title: "Media", summary: "Images, ordre, couverture et presentation" },
      { key: "review", title: "Pret", summary: "Blocages et demande de publication" },
    ];
  }

  return [
    { key: "basic", title: "هوية المشروع", summary: "الاسم والموقع السعودي المنظم" },
    { key: "sharing", title: "المالك والتفويض", summary: "الملكية والتفويض ونطاق التسويق" },
    { key: "specs", title: "الوحدات", summary: "المخزون والمساحات والغرف والتوفر" },
    { key: "payment", title: "خطة الدفع", summary: "السعر والدفعات والتمويل والحسابات" },
    { key: "compliance", title: "الامتثال السعودي", summary: "الرخصة الإعلانية ووافي والمستندات" },
    { key: "gallery", title: "الميديا والعرض", summary: "الصور والغلاف والوصف والمزايا" },
    { key: "review", title: "الجاهزية للنشر", summary: "مراجعة العوائق وطلب النشر" },
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

export const STEP_DEFINITIONS = getStepDefinitions("ar");
export const GALLERY_DISPLAY_OPTIONS = getGalleryDisplayOptions("ar");
export const GALLERY_ASPECT_OPTIONS = getGalleryAspectOptions("ar");

export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const PDF_MIME_TYPE = "application/pdf";
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;

const defaultDossier: ProjectDossierFormData = {
  projectType: "ready_property",
  lifecycleStage: "draft",
  salesMode: "developer_direct",
  city: "",
  district: "",
  neighborhood: "",
  street: "",
  nationalAddress: "",
  latitude: "",
  longitude: "",
};

const defaultUnit: ProjectUnitFormData = {
  label: "Primary unit type",
  unitKind: "unit_type",
  status: "available",
  bedrooms: "",
  bathrooms: "",
  sizeSqm: "",
  floor: "",
  view: "",
  price: "",
  handoverAt: "",
  floorPlanMedia: [],
};

const defaultPaymentPlan: ProjectPaymentPlanFormData = {
  title: "Primary payment plan",
  cashPrice: "",
  startingPrice: "",
  downPayment: "",
  escrowReference: "",
  feesAndTaxNotes: "",
  bankAndSubsidyNotes: "",
  milestones: [],
};

const defaultBrokerAuthorization: ProjectBrokerAuthorizationFormData = {
  contractNumber: "",
  marketingScope: "",
  channelsText: "",
  commissionTerms: "",
  validFrom: "",
  validUntil: "",
  evidenceFiles: [],
};

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
    dossier: { ...defaultDossier, ...initialData?.dossier },
    units: initialData?.units?.length ? initialData.units : [{ ...defaultUnit }],
    paymentPlans: initialData?.paymentPlans?.length ? initialData.paymentPlans : [{ ...defaultPaymentPlan }],
    complianceDocuments: initialData?.complianceDocuments ?? [],
    brokerAuthorization: { ...defaultBrokerAuthorization, ...initialData?.brokerAuthorization },
  };
}

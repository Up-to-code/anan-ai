import { z } from "zod";
import { normalizeDomainError } from "@/server/contracts/errors";
import { uploadedFileReferenceSchema, type UploadedFileReference } from "@/server/contracts/files";
import type { CreatePropertyInput } from "@/server/contracts/properties";
import type {
  ProjectAdLicenseInput,
  ProjectComplianceDocumentInput,
  ProjectDossierInput,
  ProjectPaymentPlanInput,
  ProjectUnitInput,
} from "@/server/contracts/projects";

export type UnitCreateFieldName =
  | "name"
  | "location"
  | "unitType"
  | "price"
  | "area"
  | "rooms"
  | "baths"
  | "floor"
  | "view"
  | "description"
  | "adLicenseNumber";

export type UnitCreateFieldErrors = Partial<Record<UnitCreateFieldName, string>>;

export type UnitCreateSubmissionFeedback = {
  message: string;
  fieldErrors: UnitCreateFieldErrors;
};

export type UnitCreateActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; feedback: UnitCreateSubmissionFeedback };

export type UnitCreateFormData = {
  name: string;
  location: string;
  unitType: "apartment" | "villa" | "duplex" | "studio" | "penthouse" | "townhouse" | "commercial";
  listingType: "sale" | "rent";
  price: string;
  area: string;
  rooms: string;
  baths: string;
  floor: string;
  view: string;
  status: "available" | "reserved" | "sold" | "draft";
  description: string;
  adLicenseNumber: string;
  paymentPlanTitle: string;
  downPayment: string;
  handoverAt: string;
  parkingSpaces: string;
  priceComparison: "below_market" | "fair_market" | "above_market" | "unknown";
  comparisonNotes: string;
  expertNotes: string;
  services: string[];
  images: UploadedFileReference[];
  privatePermitFiles: UploadedFileReference[];
};

const unitCreateSchema = z.object({
  name: z.string().trim().min(1, "اسم الوحدة مطلوب.").max(200, "اسم الوحدة طويل أكثر من اللازم."),
  location: z.string().trim().min(1, "الموقع مطلوب.").max(200, "الموقع طويل أكثر من اللازم."),
  unitType: z.enum(["apartment", "villa", "duplex", "studio", "penthouse", "townhouse", "commercial"]),
  listingType: z.enum(["sale", "rent"]),
  price: z
    .string()
    .trim()
    .min(1, "السعر مطلوب.")
    .refine((value) => parseNumber(value) > 0, "أدخل سعراً صحيحاً أكبر من صفر."),
  area: z
    .string()
    .trim()
    .min(1, "المساحة مطلوبة.")
    .refine((value) => parseNumber(value) > 0, "أدخل مساحة صحيحة أكبر من صفر."),
  rooms: z.string().trim(),
  baths: z.string().trim(),
  floor: z.string().trim().optional(),
  view: z.string().trim().optional(),
  status: z.enum(["available", "reserved", "sold", "draft"]),
  description: z.string().trim().min(1, "الوصف مطلوب."),
  adLicenseNumber: z.string().trim().max(100, "رقم الرخصة طويل أكثر من اللازم.").optional(),
  paymentPlanTitle: z.string().trim().optional(),
  downPayment: z.string().trim().optional(),
  handoverAt: z.string().trim().optional(),
  parkingSpaces: z.string().trim().optional(),
  priceComparison: z.enum(["below_market", "fair_market", "above_market", "unknown"]),
  comparisonNotes: z.string().trim().optional(),
  expertNotes: z.string().trim().optional(),
  services: z.array(z.string().trim().min(1)),
  images: z.array(uploadedFileReferenceSchema),
  privatePermitFiles: z.array(uploadedFileReferenceSchema),
}).superRefine((data, ctx) => {
  const rooms = data.rooms ? parseNumber(data.rooms) : 0;
  const baths = data.baths ? parseNumber(data.baths) : 0;

  if (data.rooms && (!Number.isFinite(rooms) || rooms < 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["rooms"], message: "أدخل عدداً صحيحاً صالحاً للغرف." });
  }

  if (data.baths && (!Number.isFinite(baths) || baths < 0)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["baths"], message: "أدخل عدداً صحيحاً صالحاً للحمامات." });
  }
});

function parseNumber(value?: string) {
  return Number((value ?? "").replace(/[^\d.]/g, "")) || 0;
}

function parseOptionalNumber(value?: string) {
  const parsed = parseNumber(value);
  return parsed > 0 ? parsed : undefined;
}

function parseOptionalDate(value?: string) {
  if (!value?.trim()) return undefined;
  const time = Date.parse(value);
  return Number.isFinite(time) ? time : undefined;
}

function splitSaudiLocation(value: string) {
  const [city, district] = value
    .split(/[,،]/)
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    city: city || value.trim() || undefined,
    district: district || city || value.trim() || undefined,
  };
}

function buildFieldErrors(error: z.ZodError): UnitCreateFieldErrors {
  const fieldErrors: UnitCreateFieldErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName !== "string" || fieldName in fieldErrors) {
      continue;
    }

    fieldErrors[fieldName as UnitCreateFieldName] = issue.message;
  }

  return fieldErrors;
}

function buildFeedback(message: string, fieldErrors: UnitCreateFieldErrors = {}): UnitCreateSubmissionFeedback {
  return { message, fieldErrors };
}

/**
 * WHY:   Standalone unit creation needs focused validation before it writes a property plus unit dossier.
 * WHAT:  Validates the unit payload and returns route-friendly feedback when required fields are missing.
 * HOW:   Uses the same Zod and flattened field-error shape as the project form submission helpers.
 */
export function validateUnitCreateSubmission(data: UnitCreateFormData): UnitCreateSubmissionFeedback | null {
  const parsed = unitCreateSchema.safeParse(data);
  if (parsed.success) {
    return null;
  }

  return buildFeedback("راجع حقول الوحدة المطلوبة ثم حاول الحفظ مرة أخرى.", buildFieldErrors(parsed.error));
}

/**
 * WHY:   A standalone unit is still an inventory record in Anan's property pipeline.
 * WHAT:  Maps unit form data into the existing property creation contract.
 * HOW:   Stores unit-specific presentation details in the body while keeping public fields searchable.
 */
export function mapUnitCreateToPropertyInput(data: UnitCreateFormData): CreatePropertyInput {
  const area = parseNumber(data.area);
  const images = data.images ?? [];

  return {
    title: data.name.trim(),
    address: data.location.trim(),
    location: data.location.trim(),
    description: data.description.trim(),
    price: parseNumber(data.price),
    beds: parseOptionalNumber(data.rooms) ?? 0,
    baths: parseOptionalNumber(data.baths) ?? 0,
    sqft: area,
    status: data.status === "draft" ? "available" : data.status,
    publicationState: "draft",
    media: images,
    body: {
      presentation: {
        descriptionShort: data.description.trim().slice(0, 280),
        slides: images,
        coverImageKey: images[0]?.key,
        galleryDisplayMode: "cover",
        galleryAspectRatio: "landscape",
        expertMetadata: {
          assetType: data.unitType,
          listingType: data.listingType,
          priceComparison: data.priceComparison,
          comparisonNotes: data.comparisonNotes.trim() || undefined,
          expertNotes: data.expertNotes.trim() || undefined,
          services: data.services.length ? data.services : undefined,
        },
        amenities: data.services.length ? data.services : undefined,
        parkingSpaces: parseOptionalNumber(data.parkingSpaces),
        hasParking: Boolean(parseOptionalNumber(data.parkingSpaces)),
        privatePermitFiles: data.privatePermitFiles.length ? data.privatePermitFiles : undefined,
        privatePermitVisibility: data.privatePermitFiles.length ? "conversation_only" : undefined,
      },
    },
    adLicenseNumber: data.adLicenseNumber.trim() || undefined,
  };
}

/**
 * WHY:   Standalone units need a dossier so project readiness and downstream workflows can understand ownership.
 * WHAT:  Creates a lightweight dossier draft from the unit identity and location.
 * HOW:   Uses `ready_property` plus private visibility by default to avoid publishing during creation.
 */
export function mapUnitCreateToDossierInput(propertyId: string, data: UnitCreateFormData): ProjectDossierInput {
  const location = splitSaudiLocation(data.location);

  return {
    propertyId,
    projectType: "ready_property",
    salesMode: "developer_direct",
    requestedVisibility: "private",
    title: data.name.trim(),
    summary: data.description.trim(),
    location: {
      countryCode: "SA",
      ...location,
    },
  };
}

/**
 * WHY:   Unit inventory should land in the same project-unit store as project wizard units.
 * WHAT:  Converts the standalone form into a single `unit` record.
 * HOW:   Uses the server-owned dossier placeholder expected by the project save service.
 */
export function mapUnitCreateToUnitInputs(data: UnitCreateFormData): ProjectUnitInput[] {
  return [{
    dossierId: "server-owned",
    label: data.name.trim(),
    unitKind: "unit",
    status: data.status,
    bedrooms: parseOptionalNumber(data.rooms) ?? 0,
    bathrooms: parseOptionalNumber(data.baths) ?? 0,
    sizeSqm: parseOptionalNumber(data.area),
    floor: data.floor.trim() || undefined,
    view: data.view.trim() || undefined,
    price: parseOptionalNumber(data.price),
    handoverAt: parseOptionalDate(data.handoverAt),
  }];
}

/**
 * WHY:   Standalone units can still carry basic payment metadata for readiness.
 * WHAT:  Builds one optional payment plan from price, down payment, and handover date.
 * HOW:   Keeps the plan active and omits empty optional fields.
 */
export function mapUnitCreateToPaymentPlanInputs(data: UnitCreateFormData): ProjectPaymentPlanInput[] {
  return [{
    dossierId: "server-owned",
    title: data.paymentPlanTitle.trim() || "Standalone unit payment plan",
    cashPrice: parseOptionalNumber(data.price),
    startingPrice: parseOptionalNumber(data.price),
    downPayment: parseOptionalNumber(data.downPayment),
    milestones: [],
    status: "active",
  }];
}

/**
 * WHY:   Legal evidence uploaded for a unit should remain attached to the same compliance path as projects.
 * WHAT:  Converts ad-license data and private permit files into compliance documents.
 * HOW:   Emits no documents when the user provides neither a license number nor files.
 */
export function mapUnitCreateToComplianceDocumentInputs(data: UnitCreateFormData): ProjectComplianceDocumentInput[] {
  if (!data.adLicenseNumber.trim() && data.privatePermitFiles.length === 0) {
    return [];
  }

  return [{
    dossierId: "server-owned",
    documentType: "ad_license",
    title: "Standalone unit advertisement license",
    licenseOrReferenceNumber: data.adLicenseNumber.trim() || undefined,
    files: data.privatePermitFiles,
  }];
}

/**
 * WHY:   Ad-license numbers should be available to the dedicated project compliance pipeline.
 * WHAT:  Builds the optional ad-license input for a standalone unit.
 * HOW:   Returns undefined when no license number is supplied, matching project create behavior.
 */
export function mapUnitCreateToAdLicenseInput(data: UnitCreateFormData): ProjectAdLicenseInput | undefined {
  const licenseNumber = data.adLicenseNumber.trim();
  if (!licenseNumber) {
    return undefined;
  }

  return {
    dossierId: "server-owned",
    licenseNumber,
    channels: ["anan_workspace", "ai_distribution"],
    evidenceFiles: data.privatePermitFiles,
  };
}

/**
 * WHY:   Create routes should return stable form feedback instead of leaking raw server exceptions.
 * WHAT:  Converts thrown errors into the unit create failed action shape.
 * HOW:   Uses the existing domain normalization helper.
 */
export function toUnitCreateActionFailure(error: unknown): UnitCreateActionResult {
  const domainError = normalizeDomainError(error);
  return {
    ok: false,
    feedback: buildFeedback(domainError.message),
  };
}

import { z } from "zod";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { normalizeDomainError } from "@/server/contracts/errors";
import { uploadedFileReferenceSchema } from "@/server/contracts/files";

export type ProjectFormFieldName =
  | "name"
  | "location"
  | "description"
  | "shortDescription"
  | "amenitiesText"
  | "parkingSpaces"
  | "units"
  | "projectScale"
  | "productMix"
  | "adLicenseNumber"
  | "privatePermitSummary"
  | "privatePermitFiles";

export type ProjectFormFieldErrors = Partial<Record<ProjectFormFieldName, string>>;

export type ProjectFormSubmissionFeedback = {
  message: string;
  fieldErrors: ProjectFormFieldErrors;
};

export type ProjectFormActionResult =
  | { ok: true; redirectTo: string }
  | { ok: false; feedback: ProjectFormSubmissionFeedback };

export type ProjectFormSaveResult =
  | { ok: true }
  | { ok: false; feedback: ProjectFormSubmissionFeedback };

const STEP_FIELD_ORDER: Array<readonly ProjectFormFieldName[]> = [
  ["name", "location"],
  ["units", "projectScale", "productMix", "parkingSpaces"],
  ["description", "shortDescription", "amenitiesText", "adLicenseNumber", "privatePermitSummary", "privatePermitFiles"],
  [],
] as const;

const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, "اسم المشروع مطلوب.").max(200, "اسم المشروع طويل أكثر من اللازم."),
    price: z.string().trim().optional(),
    location: z.string().trim().min(1, "الموقع مطلوب.").max(200, "الموقع طويل أكثر من اللازم."),
    description: z.string().trim().min(1, "الوصف الرئيسي مطلوب."),
    shortDescription: z.string().trim().max(280, "الملخص السريع يجب ألا يتجاوز 280 حرفاً."),
    amenitiesText: z.string().trim().optional(),
    projectScale: z.string().trim().optional(),
    productMix: z.string().trim().optional(),
    hasParking: z.boolean(),
    parkingSpaces: z.string(),
    privatePermitSummary: z.string().trim().optional(),
    privatePermitFiles: z.array(uploadedFileReferenceSchema),
    rooms: z.string().trim().optional(),
    baths: z.string().trim().optional(),
    area: z.string().trim().optional(),
    units: z.array(z.object({
      label: z.string().trim().optional(),
      unitKind: z.enum(["unit_type", "unit"]),
      status: z.enum(["available", "reserved", "sold", "draft"]),
      bedrooms: z.string().trim().optional(),
      bathrooms: z.string().trim().optional(),
      sizeSqm: z.string().trim().optional(),
      floor: z.string().trim().optional(),
      view: z.string().trim().optional(),
      price: z.string().trim().optional(),
      handoverAt: z.string().trim().optional(),
      floorPlanMedia: z.array(uploadedFileReferenceSchema),
    })).optional(),
    images: z.array(uploadedFileReferenceSchema),
    adLicenseNumber: z.string().trim().max(100, "رقم الرخصة طويل أكثر من اللازم.").optional(),
  })
  .superRefine((data, ctx) => {
    for (const unit of data.units ?? []) {
      const bedrooms = Number(unit.bedrooms);
      if (unit.bedrooms && (!Number.isFinite(bedrooms) || bedrooms < 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["units"], message: "أدخل عدداً صحيحاً صالحاً لغرف الوحدة." });
      }

      const bathrooms = Number(unit.bathrooms);
      if (unit.bathrooms && (!Number.isFinite(bathrooms) || bathrooms < 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["units"], message: "أدخل عدداً صحيحاً صالحاً لحمامات الوحدة." });
      }

      const sizeSqm = Number(unit.sizeSqm);
      if (unit.sizeSqm && (!Number.isFinite(sizeSqm) || sizeSqm <= 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["units"], message: "أدخل مساحة وحدة صحيحة أكبر من صفر أو اترك الحقل فارغاً." });
      }

      const price = Number(unit.price?.replace(/[^\d.]/g, ""));
      if (unit.price && (!Number.isFinite(price) || price <= 0)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["units"], message: "أدخل سعر وحدة صحيح أكبر من صفر أو اترك الحقل فارغاً." });
      }
    }

    if (data.hasParking) {
      const parkingSpaces = Number(data.parkingSpaces);
      if (!Number.isFinite(parkingSpaces) || parkingSpaces <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["parkingSpaces"],
          message: "أدخل عدد المواقف عندما تكون المواقف متاحة.",
        });
      }
    }
  });

function buildFieldErrors(error: z.ZodError): ProjectFormFieldErrors {
  const fieldErrors: ProjectFormFieldErrors = {};

  for (const issue of error.issues) {
    const fieldName = issue.path[0];
    if (typeof fieldName !== "string" || fieldName in fieldErrors) {
      continue;
    }

    fieldErrors[fieldName as ProjectFormFieldName] = issue.message;
  }

  return fieldErrors;
}

function buildFeedback(message: string, fieldErrors: ProjectFormFieldErrors = {}): ProjectFormSubmissionFeedback {
  return {
    message,
    fieldErrors,
  };
}

/**
 * WHY:   The project wizard needs immediate, field-level feedback before sending writes to the backend.
 * WHAT:  Validates the raw form payload and returns a normalized message plus field errors when invalid.
 * HOW:   Uses a Zod schema for required fields and numeric invariants, then flattens issues into UI-friendly keys.
 */
export function validateProjectFormSubmission(data: ProjectFormData): ProjectFormSubmissionFeedback | null {
  const parsed = projectFormSchema.safeParse(data);
  if (parsed.success) {
    return null;
  }

  return buildFeedback("راجع الحقول المطلوبة ثم حاول الحفظ مرة أخرى.", buildFieldErrors(parsed.error));
}

/**
 * WHY:   Project create/edit routes should not leak raw domain or Convex failures back into the client form.
 * WHAT:  Maps any thrown server-side error into the shared failed action result shape.
 * HOW:   Normalizes the error through the gateway error helper and returns a generic feedback payload.
 */
export function toProjectFormActionFailure(error: unknown): ProjectFormActionResult {
  const domainError = normalizeDomainError(error);
  return {
    ok: false,
    feedback: buildFeedback(domainError.message),
  };
}

/**
 * WHY:   Validation errors should move the wizard to the first affected step instead of staying on review.
 * WHAT:  Resolves the earliest step index touched by the current field errors.
 * HOW:   Checks the shared field-to-step order and falls back to the review step when only a general message exists.
 */
export function getFirstProjectFormErrorStep(fieldErrors: ProjectFormFieldErrors): number {
  const entries = Object.entries(fieldErrors);
  if (entries.length === 0) {
    return STEP_FIELD_ORDER.length - 1;
  }

  for (const [index, fields] of STEP_FIELD_ORDER.entries()) {
    if (fields.some((field) => field in fieldErrors)) {
      return index;
    }
  }

  return STEP_FIELD_ORDER.length - 1;
}

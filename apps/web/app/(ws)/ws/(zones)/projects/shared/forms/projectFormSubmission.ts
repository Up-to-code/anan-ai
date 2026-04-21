import { z } from "zod";
import type { ProjectFormData } from "@/app/(ws)/ws/public";
import { normalizeDomainError } from "@/server/contracts/errors";
import { uploadedFileReferenceSchema } from "@/server/contracts/files";

export type ProjectFormFieldName =
  | "name"
  | "price"
  | "location"
  | "description"
  | "shortDescription"
  | "amenitiesText"
  | "parkingSpaces"
  | "rooms"
  | "baths"
  | "area"
  | "images"
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
  ["name", "price", "location"],
  ["privatePermitSummary", "privatePermitFiles"],
  ["rooms", "baths", "area", "parkingSpaces", "adLicenseNumber"],
  ["description", "shortDescription", "amenitiesText"],
  ["adLicenseNumber", "privatePermitFiles"],
  ["images"],
  [],
] as const;

const projectFormSchema = z
  .object({
    name: z.string().trim().min(1, "اسم المشروع مطلوب.").max(200, "اسم المشروع طويل أكثر من اللازم."),
    price: z
      .string()
      .trim()
      .min(1, "السعر مطلوب.")
      .refine((value) => Number(value.replace(/[^\d.]/g, "")) > 0, "أدخل سعراً صحيحاً أكبر من صفر."),
    location: z.string().trim().min(1, "الموقع مطلوب.").max(200, "الموقع طويل أكثر من اللازم."),
    description: z.string().trim().min(1, "الوصف الرئيسي مطلوب."),
    shortDescription: z.string().trim().max(280, "الملخص السريع يجب ألا يتجاوز 280 حرفاً."),
    amenitiesText: z.string().trim().optional(),
    hasParking: z.boolean(),
    parkingSpaces: z.string(),
    privatePermitSummary: z.string().trim().optional(),
    privatePermitFiles: z.array(uploadedFileReferenceSchema),
    rooms: z.string().trim().min(1, "عدد الغرف مطلوب."),
    baths: z.string().trim().min(1, "عدد الحمامات مطلوب."),
    area: z.string().trim().optional(),
    images: z.array(uploadedFileReferenceSchema).min(1, "أضف صورة واحدة على الأقل للمشروع."),
    adLicenseNumber: z.string().trim().max(100, "رقم الرخصة طويل أكثر من اللازم.").optional(),
  })
  .superRefine((data, ctx) => {
    const rooms = Number(data.rooms);
    if (!Number.isFinite(rooms) || rooms < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rooms"],
        message: "أدخل عدداً صحيحاً صالحاً للغرف.",
      });
    }

    const baths = Number(data.baths);
    if (!Number.isFinite(baths) || baths < 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["baths"],
        message: "أدخل عدداً صحيحاً صالحاً للحمامات.",
      });
    }

    if (data.area && (!Number.isFinite(Number(data.area)) || Number(data.area) <= 0)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["area"],
        message: "أدخل مساحة صحيحة أكبر من صفر أو اترك الحقل فارغاً.",
      });
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

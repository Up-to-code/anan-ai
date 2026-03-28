export type ComposerLanguage = "ar" | "en";

export type AttachmentValidationErrorCode =
  | "unsupported_type"
  | "image_too_large"
  | "pdf_too_large"
  | "empty_selection";

/**
 * WHY:   Composer errors and helper copy should adapt to the active UI language without duplicating strings everywhere.
 * WHAT:  Resolves the current composer language from the document root and falls back to Arabic for this workspace.
 * HOW:   Reads `<html lang>` client-side and normalizes only the languages we actively support in these flows.
 */
export function resolveComposerLanguage(): ComposerLanguage {
  if (typeof document === "undefined") {
    return "ar";
  }

  return document.documentElement.lang?.toLowerCase().startsWith("en") ? "en" : "ar";
}

/**
 * WHY:   Validation and quick-action flows need consistent localized messages across inbox, offers, and assistant input.
 * WHAT:  Maps attachment validation error codes into stable Arabic/English copy.
 * HOW:   Keeps messaging centralized so new attachment surfaces inherit the same wording and tone.
 */
export function getAttachmentValidationMessage(
  code: AttachmentValidationErrorCode,
  language: ComposerLanguage = "ar",
) {
  const messages = {
    unsupported_type: {
      ar: "يسمح فقط بمشاركة صور JPG أو PNG أو WEBP أو ملفات PDF.",
      en: "Only JPG, PNG, WEBP images and PDF files are supported.",
    },
    image_too_large: {
      ar: "الحد الأقصى لحجم الصورة هو 8MB.",
      en: "The maximum image size is 8MB.",
    },
    pdf_too_large: {
      ar: "الحد الأقصى لحجم ملف PDF هو 20MB.",
      en: "The maximum PDF size is 20MB.",
    },
    empty_selection: {
      ar: "اختر صورة أو ملف PDF لإرفاقه.",
      en: "Choose an image or PDF file to attach.",
    },
  } satisfies Record<AttachmentValidationErrorCode, Record<ComposerLanguage, string>>;

  return messages[code][language];
}

/**
 * WHY:   Quick actions should explain why they are disabled instead of looking broken.
 * WHAT:  Returns localized disabled-state guidance for inbox share actions.
 * HOW:   Encodes the action-level rules close to the composer UI so product copy stays explicit and predictable.
 */
export function getQuickActionUnavailableMessage(
  action: "offer" | "project",
  language: ComposerLanguage = "ar",
) {
  const messages = {
    offer: {
      ar: "تحتاج إلى مشروع واحد على الأقل حتى تتمكن من إنشاء عرض خاص.",
      en: "You need at least one project before you can create a private offer.",
    },
    project: {
      ar: "أضف مشروعًا أولًا حتى تتمكن من مشاركته داخل المحادثة.",
      en: "Add a project first so you can share it in chat.",
    },
  } satisfies Record<"offer" | "project", Record<ComposerLanguage, string>>;

  return messages[action][language];
}

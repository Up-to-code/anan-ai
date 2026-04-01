import { getAttachmentValidationMessage, resolveComposerLanguage } from "./attachmentCopy";

export const ALLOWED_IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
export const PDF_MIME_TYPE = "application/pdf";
export const MAX_IMAGE_SIZE_BYTES = 8 * 1024 * 1024;
export const MAX_PDF_SIZE_BYTES = 20 * 1024 * 1024;
export const COMPOSER_ATTACHMENT_ACCEPT = "image/jpeg,image/png,image/webp,application/pdf";

export type AttachmentPresentationKind = "image" | "pdf";

/**
 * WHY:   Inbox, offer, and workspace composers need one shared understanding of attachment types.
 * WHAT:  Classifies a file reference into the UI kind we support across workspace surfaces.
 * HOW:   Prefers MIME when available and falls back to filename extension for uploaded records.
 */
export function getAttachmentPresentationMeta(file: {
  type?: string | null;
  mime?: string | null;
  name: string;
}) {
  const language = resolveComposerLanguage();
  const mime = file.type ?? file.mime ?? "";
  const lowerName = file.name.toLowerCase();
  const kind: AttachmentPresentationKind =
    mime.startsWith("image/") || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(lowerName) ? "image" : "pdf";

  return {
    kind,
    label:
      kind === "image"
        ? language === "fr"
          ? "Image"
          : language === "en"
            ? "Image"
            : "صورة"
        : "PDF",
  };
}

/**
 * WHY:   Attachment validation should stay aligned between drag-drop and manual file picking.
 * WHAT:  Validates supported file types and per-type size limits for workspace attachment flows.
 * HOW:   Rejects anything outside the product-approved image/PDF set with localized messages.
 */
export function validateSupportedAttachmentFiles(files: File[]) {
  const language = resolveComposerLanguage();

  for (const file of files) {
    const isImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type);
    const isPdf = file.type === PDF_MIME_TYPE;

    if (!isImage && !isPdf) {
      return getAttachmentValidationMessage("unsupported_type", language);
    }

    if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
      return getAttachmentValidationMessage("image_too_large", language);
    }

    if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
      return getAttachmentValidationMessage("pdf_too_large", language);
    }
  }

  return null;
}

/**
 * WHY:   Attachment rows need one compact file-size label regardless of surface.
 * WHAT:  Formats bytes into a small human-readable size label for previews.
 * HOW:   Uses KB for smaller files and MB for larger ones to avoid noisy precision.
 */
export function formatAttachmentSize(size: number) {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(size >= 10 * 1024 * 1024 ? 0 : 1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
}

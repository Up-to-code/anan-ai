import type { AppLocale } from "@/lib/locale";
import type { ProjectFormData } from "./types";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
  getLicenseStatusUi,
} from "./shared";

export function validateUploadSelection(
  files: File[],
  mode: "image-only" | "image-or-pdf",
  locale: AppLocale,
) {
  for (const file of files) {
    const isImage = ALLOWED_IMAGE_MIME_TYPES.has(file.type);
    const isPdf = file.type === PDF_MIME_TYPE;

    if (mode === "image-only" && !isImage) {
      return locale === "fr"
        ? "Seules les images JPG, PNG ou WEBP sont autorisees."
        : locale === "en"
          ? "Only JPG, PNG, or WEBP images are allowed."
          : "يسمح فقط برفع صور JPG أو PNG أو WEBP.";
    }

    if (mode === "image-or-pdf" && !isImage && !isPdf) {
      return locale === "fr"
        ? "Seules les images JPG, PNG, WEBP ou les fichiers PDF sont autorises."
        : locale === "en"
          ? "Only JPG, PNG, WEBP images or PDF files are allowed."
          : "يسمح فقط برفع صور JPG أو PNG أو WEBP أو ملفات PDF.";
    }

    if (isImage && file.size > MAX_IMAGE_SIZE_BYTES) {
      return locale === "fr"
        ? "La taille maximale de l'image est de 8 Mo."
        : locale === "en"
          ? "The maximum image size is 8MB."
          : "الحد الأقصى لحجم الصورة هو 8MB.";
    }

    if (isPdf && file.size > MAX_PDF_SIZE_BYTES) {
      return locale === "fr"
        ? "La taille maximale du fichier PDF est de 20 Mo."
        : locale === "en"
          ? "The maximum PDF size is 20MB."
          : "الحد الأقصى لحجم ملف PDF هو 20MB.";
    }
  }

  return null;
}

export function resolveLicenseStatusUi(
  status: "pending" | "approved" | "rejected" | null,
  locale: AppLocale,
) {
  const ui = getLicenseStatusUi(locale);
  if (!status) return ui.default;
  return ui[status];
}

export function resolveInitialCoverImageKey(initialData?: Partial<ProjectFormData>) {
  return initialData?.coverImageKey ?? initialData?.images?.[0]?.key ?? null;
}

export function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
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

export function getGalleryAspectClass(aspectRatio: ProjectFormData["galleryAspectRatio"]) {
  if (aspectRatio === "square") return "aspect-square";
  if (aspectRatio === "portrait") return "aspect-[3/4]";
  if (aspectRatio === "landscape") return "aspect-video";
  return "aspect-[4/3]";
}

import type { ProjectFormData } from "./types";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  LICENSE_STATUS_UI,
  MAX_IMAGE_SIZE_BYTES,
  MAX_PDF_SIZE_BYTES,
  PDF_MIME_TYPE,
} from "./shared";

export function validateUploadSelection(files: File[], mode: "image-only" | "image-or-pdf") {
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

export function resolveLicenseStatusUi(status: "pending" | "approved" | "rejected" | null) {
  if (!status) return LICENSE_STATUS_UI.default;
  return LICENSE_STATUS_UI[status];
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

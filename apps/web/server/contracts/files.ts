import { z } from "zod";

/**
 * WHY:   The web layer needs one stable, storage-provider-neutral file reference shape.
 * WHAT:  Validates the uploaded file metadata persisted for images and documents.
 * HOW:   Keeps only the fields the UI and repositories need to render previews and round-trip writes.
 */
export const uploadedFileReferenceSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  name: z.string().min(1),
  size: z.number().int().nonnegative().optional(),
  mime: z.string().min(1).optional(),
});

export type UploadedFileReference = z.infer<typeof uploadedFileReferenceSchema>;

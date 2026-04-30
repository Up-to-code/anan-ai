import { z } from "zod/v3";

export const allowedUploadedFileMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const uploadedFileReferenceSchema = z.object({
  key: z.string().trim().min(1).max(512),
  url: z.string().url(),
  name: z.string().trim().min(1).max(180),
  size: z.number().finite().nonnegative().max(32 * 1024 * 1024).optional(),
  mime: z.enum(allowedUploadedFileMimeTypes).optional(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/u).optional(),
});

export const uploadedFileReferenceListSchema = z.array(uploadedFileReferenceSchema);

export type UploadedFileReferenceInput = z.infer<typeof uploadedFileReferenceSchema>;

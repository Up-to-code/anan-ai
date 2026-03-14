import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

/**
 * WHY:   Workspace create/edit flows need dedicated upload endpoints for media and documents.
 * WHAT:  Defines the UploadThing file router used by the Next app API handler and typed client helpers.
 * HOW:   Exposes one endpoint per business attachment class while keeping auth/business writes in server actions.
 */
export const uploadRouter = {
  propertyMedia: f({
    image: {
      maxFileCount: 12,
      maxFileSize: "8MB",
    },
  }).onUploadComplete(async ({ file }) => ({
    key: file.key,
    url: file.ufsUrl,
    name: file.name,
    size: file.size,
    mime: file.type || undefined,
  })),
  offerAttachments: f(["image", "pdf"]).onUploadComplete(async ({ file }) => ({
    key: file.key,
    url: file.ufsUrl,
    name: file.name,
    size: file.size,
    mime: file.type || undefined,
  })),
  crmDocuments: f(["image", "pdf", "text"]).onUploadComplete(async ({ file }) => ({
    key: file.key,
    url: file.ufsUrl,
    name: file.name,
    size: file.size,
    mime: file.type || undefined,
  })),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

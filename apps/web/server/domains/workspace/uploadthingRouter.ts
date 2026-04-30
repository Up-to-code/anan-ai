import { createHash } from "node:crypto";
import { createRepositoryRefs, voidMutationRef } from "@anan/convex-adapters/repository";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { apiUnsafe } from "@/lib/convexApi";
import { requireSessionContext } from "@/server/auth/session";

const f = createUploadthing();
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 32 * 1024 * 1024;
const ALLOWED_UPLOAD_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "application/pdf"]);
const TRUSTED_UPLOAD_HOST_SUFFIXES = ["ufs.sh", "utfs.io", "uploadthing.com"];

const uploadthingApi = createRepositoryRefs<{
  trackUploadthingFile: unknown;
}>(apiUnsafe, "shared_logic/uploadthing");

async function requireUploadthingMetadata() {
  const session = await requireSessionContext();
  return {
    authUserId: session.context.userId,
    convexToken: session.token,
  };
}

async function trackUploadthingCompletion(args: {
  token: string;
  category: "propertyMedia" | "offerAttachments" | "crmDocuments" | "verificationDocuments";
  file: { key: string; url: string; name: string; size: number; type: string; sha256: string };
}) {
  await voidMutationRef(
    args.token,
    uploadthingApi.trackUploadthingFile,
    {
      category: args.category,
      file: {
        key: args.file.key,
        url: args.file.url,
        name: args.file.name,
        size: args.file.size,
        mime: args.file.type,
        sha256: args.file.sha256,
      },
    },
  );
}

function isTrustedUploadUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  return parsed.protocol === "https:" && TRUSTED_UPLOAD_HOST_SUFFIXES.some((host) => (
    parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
  ));
}

function detectMime(buffer: Buffer) {
  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.length >= 5 && buffer.subarray(0, 5).toString("ascii") === "%PDF-") {
    return "application/pdf";
  }
  return null;
}

async function verifyUploadedFile(args: {
  category: "propertyMedia" | "offerAttachments" | "crmDocuments" | "verificationDocuments";
  file: { key: string; ufsUrl: string; name: string; size: number; type?: string };
}) {
  const mime = args.file.type;
  const maxBytes = mime === "application/pdf" ? MAX_DOCUMENT_BYTES : MAX_IMAGE_BYTES;
  if (!mime || !ALLOWED_UPLOAD_MIME_TYPES.has(mime)) {
    throw new Error("Upload MIME type is not allowed");
  }
  if (args.category === "propertyMedia" && mime === "application/pdf") {
    throw new Error("Property media uploads must be images");
  }
  if (!isTrustedUploadUrl(args.file.ufsUrl)) {
    throw new Error("Upload URL is not trusted");
  }
  if (!args.file.key.trim() || args.file.key.length > 512) {
    throw new Error("Upload key is invalid");
  }
  if (!args.file.name.trim() || args.file.name.length > 180) {
    throw new Error("Upload name is invalid");
  }
  if (!Number.isFinite(args.file.size) || args.file.size <= 0 || args.file.size > maxBytes) {
    throw new Error("Upload size is invalid");
  }

  const response = await fetch(args.file.ufsUrl);
  if (!response.ok) {
    throw new Error("Uploaded file could not be verified");
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length <= 0 || bytes.length > maxBytes) {
    throw new Error("Uploaded file size failed verification");
  }
  const detectedMime = detectMime(bytes);
  if (detectedMime !== mime) {
    throw new Error("Uploaded file MIME type does not match file contents");
  }
  return {
    key: args.file.key,
    url: args.file.ufsUrl,
    name: args.file.name,
    size: bytes.length,
    type: mime,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}

/**
 * WHY:   Workspace create/edit flows need dedicated upload endpoints for media and documents.
 * WHAT:  Defines the UploadThing file router used by the Next app API handler and typed client helpers.
 * HOW:   Exposes one endpoint per business attachment class while keeping auth/business writes in server actions.
 */
export const uploadRouter = {
  propertyMedia: f({
    "image/jpeg": {
      maxFileCount: 12,
      maxFileSize: "8MB",
    },
    "image/png": {
      maxFileCount: 12,
      maxFileSize: "8MB",
    },
    "image/webp": {
      maxFileCount: 12,
      maxFileSize: "8MB",
    },
  })
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      const verifiedFile = await verifyUploadedFile({ category: "propertyMedia", file });
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "propertyMedia",
        file: verifiedFile,
      });
      return {
        key: verifiedFile.key,
        url: verifiedFile.url,
        name: verifiedFile.name,
        size: verifiedFile.size,
        mime: verifiedFile.type,
        sha256: verifiedFile.sha256,
      };
    }),
  offerAttachments: f({
    "image/jpeg": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/png": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/webp": { maxFileSize: "8MB", maxFileCount: 6 },
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 6 },
  })
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      const verifiedFile = await verifyUploadedFile({ category: "offerAttachments", file });
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "offerAttachments",
        file: verifiedFile,
      });
      return {
        key: verifiedFile.key,
        url: verifiedFile.url,
        name: verifiedFile.name,
        size: verifiedFile.size,
        mime: verifiedFile.type,
        sha256: verifiedFile.sha256,
      };
    }),
  crmDocuments: f({
    "image/jpeg": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/png": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/webp": { maxFileSize: "8MB", maxFileCount: 6 },
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 6 },
  })
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      const verifiedFile = await verifyUploadedFile({ category: "crmDocuments", file });
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "crmDocuments",
        file: verifiedFile,
      });
      return {
        key: verifiedFile.key,
        url: verifiedFile.url,
        name: verifiedFile.name,
        size: verifiedFile.size,
        mime: verifiedFile.type,
        sha256: verifiedFile.sha256,
      };
    }),
  verificationDocuments: f({
    "image/jpeg": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/png": { maxFileSize: "8MB", maxFileCount: 6 },
    "image/webp": { maxFileSize: "8MB", maxFileCount: 6 },
    "application/pdf": { maxFileSize: "32MB", maxFileCount: 6 },
  })
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      const verifiedFile = await verifyUploadedFile({ category: "verificationDocuments", file });
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "verificationDocuments",
        file: verifiedFile,
      });
      return {
        key: verifiedFile.key,
        url: verifiedFile.url,
        name: verifiedFile.name,
        size: verifiedFile.size,
        mime: verifiedFile.type,
        sha256: verifiedFile.sha256,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

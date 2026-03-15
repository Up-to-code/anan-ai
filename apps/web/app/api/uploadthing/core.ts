import { createUploadthing, type FileRouter } from "uploadthing/next";
import { fetchMutation } from "convex/nextjs";
import { requireSessionContext } from "@/server/auth/session";
import { apiUnsafe } from "@/lib/convexApi";

const f = createUploadthing();
const uploadthingApi = apiUnsafe["shared_logic/uploadthing"] as {
  trackUploadthingFile: unknown;
};

async function requireUploadthingMetadata() {
  const session = await requireSessionContext();
  return {
    authUserId: session.context.userId,
    convexToken: session.token,
  };
}

async function trackUploadthingCompletion(args: {
  token: string;
  category: "propertyMedia" | "offerAttachments" | "crmDocuments";
  file: { key: string; ufsUrl: string; name: string; size: number; type?: string };
}) {
  await fetchMutation(
    uploadthingApi.trackUploadthingFile as never,
    {
      category: args.category,
      file: {
        key: args.file.key,
        url: args.file.ufsUrl,
        name: args.file.name,
        size: args.file.size,
        mime: args.file.type ?? undefined,
      },
    } as never,
    { token: args.token },
  );
}

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
  })
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "propertyMedia",
        file,
      });
      return {
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        mime: file.type || undefined,
      };
    }),
  offerAttachments: f(["image", "pdf"])
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "offerAttachments",
        file,
      });
      return {
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        mime: file.type || undefined,
      };
    }),
  crmDocuments: f(["image", "pdf", "text"])
    .middleware(async () => requireUploadthingMetadata())
    .onUploadComplete(async ({ file, metadata }) => {
      await trackUploadthingCompletion({
        token: metadata.convexToken,
        category: "crmDocuments",
        file,
      });
      return {
        key: file.key,
        url: file.ufsUrl,
        name: file.name,
        size: file.size,
        mime: file.type || undefined,
      };
    }),
} satisfies FileRouter;

export type UploadRouter = typeof uploadRouter;

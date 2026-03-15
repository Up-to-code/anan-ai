import { UploadThingFiles } from "@mzedstudio/uploadthingtrack";
import { components } from "./_generated/api";

/**
 * WHY:   UploadThing uploads must be tracked with ownership, tags, and access metadata.
 * WHAT:  Provides a single UploadThing file tracker client for Convex mutations/queries.
 * HOW:   Wraps the UploadThing file tracker component registered in `convex.config.ts`.
 */
export const uploadthingFiles = new UploadThingFiles(components.uploadthingFileTracker);

"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";

const uploadthingDisabledMessage =
  "Uploads are not configured. Set UPLOADTHING_TOKEN in apps/web/.env.local and restart the web app.";
const uploadthingEnabled = process.env.NEXT_PUBLIC_UPLOADTHING_ENABLED === "true";
const generatedHelpers = generateReactHelpers<UploadRouter>();

/**
 * WHY:   Client forms should consume typed UploadThing helpers without duplicating endpoint strings.
 * WHAT:  Exports the generated upload hook for this app's router with a safe disabled fallback.
 * HOW:   Uses a build-time feature flag so local/dev sessions without UploadThing config avoid route probing spam.
 */
export function useUploadThing<TEndpoint extends keyof UploadRouter>(endpoint: TEndpoint) {
  if (!uploadthingEnabled) {
    return {
      startUpload: async () => {
        throw new Error(uploadthingDisabledMessage);
      },
      isUploading: false,
      routeConfig: undefined,
      permittedFileInfo: undefined,
    };
  }

  return generatedHelpers.useUploadThing(endpoint);
}

export { uploadthingEnabled, uploadthingDisabledMessage };

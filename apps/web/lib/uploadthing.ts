"use client";

import { generateReactHelpers } from "@uploadthing/react";
import type { UploadRouter } from "@/app/api/uploadthing/core";

/**
 * WHY:   Client forms should consume typed UploadThing helpers without duplicating endpoint strings.
 * WHAT:  Exports the generated upload button/hook helpers for this app's router.
 * HOW:   Binds the helpers once to the shared UploadThing router type.
 */
export const { useUploadThing, uploadFiles } = generateReactHelpers<UploadRouter>();

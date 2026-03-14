import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

/**
 * WHY:   The web app needs a standard Next route handler for UploadThing uploads.
 * WHAT:  Exposes GET/POST handlers for the typed upload router.
 * HOW:   Reads the UploadThing token from environment-only configuration.
 */
export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
});

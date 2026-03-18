import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

function requireUploadthingToken() {
  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "Missing UPLOADTHING_TOKEN. Set it in apps/web/.env.local (dev) and your web deployment environment.",
    );
  }
  return token;
}

const uploadthingToken = requireUploadthingToken();

/**
 * WHY:   The web app needs a standard Next route handler for UploadThing uploads.
 * WHAT:  Exposes GET/POST handlers for the typed upload router.
 * HOW:   Reads and validates `UPLOADTHING_TOKEN`, then passes it explicitly into UploadThing route config.
 */
export const { GET, POST } = createRouteHandler({
  router: uploadRouter,
  config: {
    token: uploadthingToken,
  },
});

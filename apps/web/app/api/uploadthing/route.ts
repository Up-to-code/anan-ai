import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

const missingUploadthingTokenMessage =
  "Missing UPLOADTHING_TOKEN in the web app environment. Set it in apps/web/.env.local for localhost and restart pnpm dev:web; Convex Cloud env vars are separate.";
const uploadthingToken = process.env.UPLOADTHING_TOKEN?.trim();
const uploadthingHandlers = uploadthingToken
  ? createRouteHandler({
      router: uploadRouter,
      config: {
        token: uploadthingToken,
      },
    })
  : null;

function missingTokenResponse() {
  return Response.json(
    {
      code: "UPLOADTHING_NOT_CONFIGURED",
      message: missingUploadthingTokenMessage,
      status: 503,
    },
    { status: 503 },
  );
}

/**
 * WHY:   The web app needs a standard Next route handler for UploadThing uploads.
 * WHAT:  Exposes GET/POST handlers for the typed upload router.
 * HOW:   If `UPLOADTHING_TOKEN` is configured, forwards to UploadThing's route handler.
 *        Otherwise returns a stable 503 payload instead of crashing the route module at import time.
 */
export async function GET(request: Request) {
  if (!uploadthingHandlers) {
    return missingTokenResponse();
  }

  return uploadthingHandlers.GET(request as never);
}

export async function POST(request: Request) {
  if (!uploadthingHandlers) {
    return missingTokenResponse();
  }

  return uploadthingHandlers.POST(request as never);
}

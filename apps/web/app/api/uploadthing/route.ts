import { createRouteHandler } from "uploadthing/next";
import { uploadRouter } from "./core";

const missingUploadthingTokenMessage =
  "Missing UPLOADTHING_TOKEN. Set it in apps/web/.env.local (dev) and your web deployment environment.";
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
export async function GET(request: Request, context: unknown) {
  if (!uploadthingHandlers) {
    return missingTokenResponse();
  }

  return uploadthingHandlers.GET(request as never, context as never);
}

export async function POST(request: Request, context: unknown) {
  if (!uploadthingHandlers) {
    return missingTokenResponse();
  }

  return uploadthingHandlers.POST(request as never, context as never);
}

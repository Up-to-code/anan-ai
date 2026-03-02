import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { createAuth } from "./_core/auth";
import {
  handleWhatsAppWebhookGet,
  handleWhatsAppWebhookPost,
} from "./ai_zone/channels/whatsapp/webhook";
import { corsRouter } from "convex-helpers/server/cors";
import { generateRandomString } from "better-auth/crypto";

const http = httpRouter();

// ─── Better Auth with OTT Injection ─────────────────────────────
// We CANNOT use authComponent.registerRoutes because the crossDomain
// plugin's "after" hook does not fire for OAuth callback 302 redirects.
// Instead, we manually register the auth routes and wrap the handler so
// we can post-process the response to inject an OTT parameter.

const convexSiteUrl =
  process.env.CONVEX_SITE_URL ??
  "https://keen-oyster-497.eu-west-1.convex.site";

const appUrl = process.env.SITE_URL ?? "http://localhost:5173";

const trustedOriginsFromEnv = (
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? process.env.TRUSTED_ORIGINS ?? ""
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const trustedOrigins = Array.from(
  new Set([
    convexSiteUrl,
    appUrl,
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    ...trustedOriginsFromEnv,
  ]),
);

/**
 * Wraps the Better Auth handler. For OAuth callback redirects (302 with
 * a session_token cookie), it extracts the token, generates a one-time-token,
 * stores it, and appends ?ott= to the redirect URL so the frontend
 * crossDomainClient can exchange it for a valid session.
 */
const authRequestHandler = httpAction(async (ctx, request) => {
  const auth = createAuth(ctx as any);
  const response = await auth.handler(request);

  // Only post-process 302 redirects that carry a session_token cookie
  if (response.status === 302 || response.status === 307) {
    const setCookie = response.headers.get("set-cookie");
    const location = response.headers.get("location");

    if (setCookie && location) {
      const match = setCookie.match(/session_token=([^;]+)/);
      if (match) {
        try {
          // The session_token cookie value is usually `[token].[signature]`.
          // The Better Auth database only stores the `[token]` half.
          const rawToken = decodeURIComponent(match[1]);
          const sessionToken = rawToken.split('.')[0];
          const token = generateRandomString(32);
          const expiresAt = new Date(Date.now() + 3 * 60 * 1000);

          // Store the OTT → session_token mapping
          // Use the internal adapter from auth context
          const authCtx = await (auth as any).$context;
          await authCtx.internalAdapter.createVerificationValue({
            value: sessionToken,
            identifier: `one-time-token:${token}`,
            expiresAt,
          });

          const url = new URL(location);
          url.searchParams.set("ott", token);

          // Build a new response with the updated location
          const newHeaders = new Headers(response.headers);
          newHeaders.set("location", url.toString());
          return new Response(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: newHeaders,
          });
        } catch (e) {
          console.error("[OTT] Error injecting OTT:", e);
        }
      }
    }
  }

  return response;
});

// CORS wrapper for the auth routes
const cors = corsRouter(http, {
  allowedOrigins: trustedOrigins,
  allowCredentials: true,
  allowedHeaders: ["Content-Type", "Better-Auth-Cookie", "Authorization"],
  exposedHeaders: ["Set-Better-Auth-Cookie"],
  debug: false,
  enforceAllowOrigins: false,
});

// Well-known OIDC redirect
http.route({
  path: "/.well-known/openid-configuration",
  method: "GET",
  handler: httpAction(async () => {
    const url = `${convexSiteUrl}/api/auth/convex/.well-known/openid-configuration`;
    return Response.redirect(url, 302);
  }),
});

cors.route({
  pathPrefix: "/api/auth/",
  method: "GET",
  handler: authRequestHandler,
});

cors.route({
  pathPrefix: "/api/auth/",
  method: "POST",
  handler: authRequestHandler,
});

// ─── Other Routes ───────────────────────────────────────────────

http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
});

http.route({
  path: "/api/whatsapp/webhook",
  method: "GET",
  handler: httpAction(async (ctx, request) =>
    handleWhatsAppWebhookGet(ctx, request),
  ),
});

http.route({
  path: "/api/whatsapp/webhook",
  method: "POST",
  handler: handleWhatsAppWebhookPost,
});

export default http;

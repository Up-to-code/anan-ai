import { httpRouter } from "convex/server";
import { registerRoutes } from "@mzedstudio/uploadthingtrack";
import { httpAction } from "./_generated/server";
import { components } from "./_generated/api";
import { authComponent, createAuth } from "./betterAuth/auth";
import {
  buildAuthErrorRedirectUrl,
  resolveAppRedirectBaseUrl,
} from "./_core/security/authRedirects";
import {
  handleAuthorize,
  handleDelegatedClients,
  handleDelegatedProperties,
  handleJwks,
  handleMetadata,
  handleRevoke,
  handleToken,
  handleUserInfo,
} from "./_core/oauth/http";

const http = httpRouter();

function resolveBackendAuthErrorRedirect(request: Request) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");
  if (!error) return null;

  const appBaseUrl = resolveAppRedirectBaseUrl({
    ananWebUrl: process.env.ANAN_WEB_URL,
    siteUrl: process.env.SITE_URL,
    nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    vercelUrl: process.env.VERCEL_URL,
    fallbackOrigin: request.headers.get("origin"),
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  });
  if (!appBaseUrl) return null;

  return buildAuthErrorRedirectUrl(appBaseUrl, {
    error,
    returnTo: requestUrl.searchParams.get("returnTo") ?? "/ws",
  });
}

http.route({
  path: "/",
  method: "GET",
  handler: httpAction(async (_ctx, request) => {
    const redirectTo = resolveBackendAuthErrorRedirect(request);
    if (redirectTo) {
      return Response.redirect(redirectTo, 302);
    }
    return Response.redirect(buildAuthErrorRedirectUrl(
      resolveAppRedirectBaseUrl({
        ananWebUrl: process.env.ANAN_WEB_URL,
        siteUrl: process.env.SITE_URL,
        nextPublicSiteUrl: process.env.NEXT_PUBLIC_SITE_URL,
        vercelUrl: process.env.VERCEL_URL,
        fallbackOrigin: request.headers.get("origin"),
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      }) ?? "http://localhost:3000",
      { returnTo: "/ws" },
    ), 302);
  }),
});

authComponent.registerRoutes(http, createAuth, { cors: true });
registerRoutes(http, components.uploadthingFileTracker);

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
  path: "/authorize",
  method: "GET",
  handler: handleAuthorize,
});

http.route({
  path: "/token",
  method: "POST",
  handler: handleToken,
});

http.route({
  path: "/userinfo",
  method: "GET",
  handler: handleUserInfo,
});

http.route({
  path: "/userinfo",
  method: "POST",
  handler: handleUserInfo,
});

http.route({
  path: "/revoke",
  method: "POST",
  handler: handleRevoke,
});

http.route({
  path: "/.well-known/oauth-authorization-server",
  method: "GET",
  handler: handleMetadata,
});

http.route({
  path: "/jwks.json",
  method: "GET",
  handler: handleJwks,
});

http.route({
  path: "/api/oauth/clients",
  method: "GET",
  handler: handleDelegatedClients,
});

http.route({
  path: "/api/oauth/clients",
  method: "POST",
  handler: handleDelegatedClients,
});

http.route({
  path: "/api/oauth/properties",
  method: "GET",
  handler: handleDelegatedProperties,
});

http.route({
  path: "/api/oauth/properties",
  method: "POST",
  handler: handleDelegatedProperties,
});

export default http;

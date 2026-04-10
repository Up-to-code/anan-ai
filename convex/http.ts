import { httpRouter } from "convex/server";
import { registerRoutes } from "@mzedstudio/uploadthingtrack";
import { httpAction } from "./_generated/server";
import {
  handleWhatsAppWebhookGet,
  handleWhatsAppWebhookPost,
} from "./ai_zone/channels/whatsapp/webhook";
import { components } from "./_generated/api";
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
  path: "/api/whatsapp/webhook",
  method: "GET",
  handler: httpAction(handleWhatsAppWebhookGet),
});

http.route({
  path: "/api/whatsapp/webhook",
  method: "POST",
  handler: handleWhatsAppWebhookPost,
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

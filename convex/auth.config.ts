import type { AuthConfig } from "convex/server";

/**
 * WHY:   Convex still needs an auth config so deployed functions can verify JWTs issued by Convex Auth.
 * WHAT:  Registers the local Convex deployment itself as the auth issuer.
 * HOW:   Uses the current `CONVEX_SITE_URL` as issuer domain and the default `convex` audience.
 */
export default {
  providers: [
    {
      domain: process.env.CONVEX_SITE_URL ?? "https://example.convex.site",
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

import type { AuthConfig } from "convex/server";
import { resolveConvexAuthIssuer } from "./_core/security/authIssuer";

/**
 * WHY:   Convex still needs an auth config so deployed functions can verify JWTs issued by Convex Auth.
 * WHAT:  Registers the local Convex deployment itself as the auth issuer.
 * HOW:   Uses the current `CONVEX_SITE_URL` as issuer domain and the default `convex` audience.
 */
export default {
  providers: [
    {
      domain: resolveConvexAuthIssuer(),
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

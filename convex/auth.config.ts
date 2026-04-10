import type { AuthConfig } from "convex/server";

/**
 * WHY:   Convex must validate Clerk-issued JWTs before authenticated queries and mutations trust the caller.
 * WHAT:  Registers Clerk as the sole JWT issuer for Convex-backed app sessions.
 * HOW:   Uses `CLERK_JWT_ISSUER_DOMAIN` and the `convex` application id required by the official Convex Clerk integration.
 */
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;

import type { AuthConfig } from "convex/server";
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";

/**
 * WHY:   Convex must validate Better Auth JWTs before authenticated queries and mutations trust the caller.
 * WHAT:  Registers the Better Auth Convex provider as the issuer for app sessions.
 * HOW:   Uses the official Convex Better Auth component auth config provider.
 */
export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;

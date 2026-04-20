"use client";

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { emailOTPClient, organizationClient } from "better-auth/client/plugins";

/**
 * WHY:   Browser code needs one typed Better Auth client for sign-in, sessions, and organization actions.
 * WHAT:  Creates the web Better Auth client with Convex token and organization plugins.
 * HOW:   Proxies requests through the Next `/api/auth` route backed by the Convex site auth routes.
 */
export const authClient = createAuthClient({
  plugins: [convexClient(), organizationClient(), emailOTPClient()],
});

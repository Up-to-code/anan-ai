"use client";

import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

/**
 * WHY:   Admin browser code needs one auth client for password sign-in, sign-out, and Convex token refresh.
 * WHAT:  Creates the Better Auth client used by the admin console.
 * HOW:   Proxies auth calls through the admin Next `/api/auth` bridge backed by Convex Better Auth routes.
 */
export const authClient = createAuthClient({
  plugins: [convexClient()],
});

import { handleRoute, okResponse } from "@anan/web-foundation/api";
import { syncCurrentOrganizationFromBetterAuth } from "@/server/domains/auth/organizations/service";

/**
 * WHY:   Switching the active Better Auth organization on the client must also rebind the server-side workspace context.
 * WHAT:  Syncs the current Convex org bridge from the active Better Auth organization claim.
 * HOW:   Delegates to the organizations domain service and returns the mapped organization summary when available.
 */
export async function POST() {
  return handleRoute(async () => {
    const organization = await syncCurrentOrganizationFromBetterAuth();
    return okResponse({ ok: true, organization });
  });
}

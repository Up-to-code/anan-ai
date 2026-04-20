import { toErrorResponse } from "@/server/contracts/errors";
import { syncCurrentOrganizationFromBetterAuth } from "@/server/domains/auth/organizations/service";

/**
 * WHY:   Switching the active Better Auth organization on the client must also rebind the server-side workspace context.
 * WHAT:  Syncs the current Convex org bridge from the active Better Auth organization claim.
 * HOW:   Delegates to the organizations domain service and returns the mapped organization summary when available.
 */
export async function POST() {
  try {
    const organization = await syncCurrentOrganizationFromBetterAuth();
    return Response.json({ ok: true, organization }, { status: 200 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

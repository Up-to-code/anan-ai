import { requireSessionContext } from "@/server/auth/session";
import { toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   External consumers and future client-side hooks need one gateway endpoint for the current authenticated session.
 * WHAT:  Returns the normalized SessionContext for the current request.
 * HOW:   Delegates session resolution to the auth layer and serializes domain errors consistently.
 */
export async function GET() {
  try {
    const session = await requireSessionContext();
    return Response.json(session.context);
  } catch (error) {
    return toErrorResponse(error);
  }
}

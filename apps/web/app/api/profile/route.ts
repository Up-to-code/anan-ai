import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import {
  getCurrentProfileForCurrentUser,
  updateCurrentProfileForCurrentUser,
} from "@/server/domains/profiles/service";

/**
 * WHY:   The migrated gateway needs a stable profile endpoint separate from raw Convex queries.
 * WHAT:  Returns the current authenticated user's profile summary.
 * HOW:   Delegates to the profiles domain service and maps failures through the domain error serializer.
 */
export async function GET() {
  try {
    const profile = await getCurrentProfileForCurrentUser();
    return Response.json(profile);
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Profile edits should flow through one server-owned HTTP entrypoint.
 * WHAT:  Updates the current authenticated user's profile name and username.
 * HOW:   Parses the JSON body, delegates to the profiles service, and normalizes invalid JSON errors.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    return Response.json(await updateCurrentProfileForCurrentUser(body));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toErrorResponse(
        new DomainError({
          code: "INVALID_REQUEST",
          message: "Request body must be valid JSON",
          status: 400,
        }),
      );
    }
    return toErrorResponse(error);
  }
}

import { toErrorResponse } from "@/server/contracts/errors";
import { updateCurrentOrganizationForCurrentUser } from "@/server/domains/organizations/service";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   The workspace settings UI needs one current-organization mutation endpoint owned by the gateway.
 * WHAT:  Updates the current organization's editable fields.
 * HOW:   Reads JSON, delegates to the organizations domain service, and serializes normalized failures.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    return Response.json(await updateCurrentOrganizationForCurrentUser(body));
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

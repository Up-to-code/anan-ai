import { NextRequest } from "next/server";
import { searchCurrentOrganizationDirectoryExact } from "@/server/domains/organizations/service";
import { toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   Team invite and direct-message flows need one exact-match directory lookup owned by the server.
 * WHAT:  Returns at most the exact organization-directory matches for a full email or username.
 * HOW:   Reads `q` from the request, delegates to the organizations service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    return Response.json(await searchCurrentOrganizationDirectoryExact(query));
  } catch (error) {
    return toErrorResponse(error);
  }
}

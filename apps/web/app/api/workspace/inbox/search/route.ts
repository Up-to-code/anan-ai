import { NextRequest } from "next/server";
import { searchInboxTargets } from "@/server/domains/inbox/service";
import { toErrorResponse } from "@/server/contracts/errors";

/**
 * WHY:   Inbox compose flows need a server-owned search endpoint for recipient discovery.
 * WHAT:  Returns matching inbox targets for the current workspace user.
 * HOW:   Reads `q` from the request URL, delegates to the inbox domain service, and serializes normalized failures.
 */
export async function GET(request: NextRequest) {
  try {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    return Response.json(await searchInboxTargets(query));
  } catch (error) {
    return toErrorResponse(error);
  }
}

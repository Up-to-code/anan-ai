import { NextRequest } from "next/server";
import { handleRoute, jsonResponse } from "@anan/web-foundation/api";
import { searchInboxTargets } from "@/server/domains/workspace/inbox/service";

/**
 * WHY:   Inbox compose flows need a server-owned search endpoint for recipient discovery.
 * WHAT:  Returns matching inbox targets for the current workspace user.
 * HOW:   Reads `q` from the request URL, delegates to the inbox domain service, and serializes normalized failures.
 */
export async function GET(request: NextRequest) {
  return handleRoute(async () => {
    const query = request.nextUrl.searchParams.get("q") ?? "";
    return jsonResponse(await searchInboxTargets(query));
  });
}

import { handleRoute, okResponse, parseJsonBody } from "@anan/web-foundation/api";
import { markInboxConversationRead } from "@/server/domains/workspace/inbox/service";
import { markConversationReadInputSchema } from "@/server/contracts/inbox";

/**
 * WHY:   Inbox rows need one write endpoint for read-state changes without exposing direct server dependencies to the client.
 * WHAT:  Marks a conversation as read for the current workspace user.
 * HOW:   Validates the payload with the shared contract, delegates to the inbox domain service, and normalizes failures.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const payload = await parseJsonBody(request, markConversationReadInputSchema, "Invalid conversation payload");
    await markInboxConversationRead(payload);
    return okResponse();
  });
}

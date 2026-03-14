import { markInboxConversationRead } from "@/server/domains/inbox/service";
import { markConversationReadInputSchema } from "@/server/contracts/inbox";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   Inbox rows need one write endpoint for read-state changes without exposing direct server dependencies to the client.
 * WHAT:  Marks a conversation as read for the current workspace user.
 * HOW:   Validates the payload with the shared contract, delegates to the inbox domain service, and normalizes failures.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = markConversationReadInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid conversation payload",
        status: 400,
      });
    }

    await markInboxConversationRead(parsed.data);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

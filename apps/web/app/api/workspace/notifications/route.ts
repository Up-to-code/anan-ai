import { markWorkspaceNotificationRead } from "@/server/domains/workspace/notifications/service";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   Notification rows still need one write endpoint for read-state mutations.
 * WHAT:  Marks a single notification as read for the current workspace user.
 * HOW:   Parses JSON, validates the required notification id, delegates to the notifications service, and normalizes failures.
 */
export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as { notificationId?: string };
    if (!body.notificationId) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "notificationId is required",
        status: 400,
      });
    }
    await markWorkspaceNotificationRead(body.notificationId);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

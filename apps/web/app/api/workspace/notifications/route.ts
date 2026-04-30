import { handleRoute, okResponse, readJsonBody } from "@anan/web-foundation/api";
import { markWorkspaceNotificationRead } from "@/server/domains/workspace/notifications/service";
import { DomainError } from "@/server/contracts/errors";

/**
 * WHY:   Notification rows still need one write endpoint for read-state mutations.
 * WHAT:  Marks a single notification as read for the current workspace user.
 * HOW:   Parses JSON, validates the required notification id, delegates to the notifications service, and normalizes failures.
 */
export async function PATCH(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody<{ notificationId?: string }>(request);
    if (!body.notificationId) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "notificationId is required",
        status: 400,
      });
    }
    await markWorkspaceNotificationRead(body.notificationId);
    return okResponse();
  });
}

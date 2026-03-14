import { NextRequest } from "next/server";
import {
  getWorkspaceNotificationSummary,
  listWorkspaceNotifications,
  markWorkspaceNotificationRead,
} from "@/server/domains/notifications/service";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   Workspace shells need one gateway endpoint for notifications list and summary reads.
 * WHAT:  Returns either unread-summary counters or a page of notifications based on query params.
 * HOW:   Reads `summary` and `limit` from the request, delegates to the notifications service, and normalizes failures.
 */
export async function GET(request: NextRequest) {
  try {
    if (request.nextUrl.searchParams.get("summary") === "1") {
      return Response.json(await getWorkspaceNotificationSummary());
    }

    const limitParam = request.nextUrl.searchParams.get("limit");
    const limit = limitParam ? Number(limitParam) : undefined;
    return Response.json(await listWorkspaceNotifications(Number.isFinite(limit) ? limit : undefined));
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Notification rows need one write endpoint for read-state mutations.
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

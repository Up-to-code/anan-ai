import {
  getWorkspacePushConfig,
  registerWorkspacePushSubscription,
  removeWorkspacePushSubscription,
  updateWorkspaceNotificationPreferences,
} from "@/server/domains/notifications/service";
import { pushSubscriptionInputSchema } from "@/server/contracts/notifications";
import { DomainError, toErrorResponse } from "@/server/contracts/errors";
import { toInvalidJsonResponse } from "@/app/api/_shared/errors";

/**
 * WHY:   Push onboarding needs one read endpoint for browser configuration and current preference state.
 * WHAT:  Returns the current workspace push notification configuration.
 * HOW:   Delegates to the notifications domain service and serializes normalized failures.
 */
export async function GET() {
  try {
    return Response.json(await getWorkspacePushConfig());
  } catch (error) {
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Browser push registration should remain behind a single authenticated gateway mutation.
 * WHAT:  Enables browser push preferences and registers a subscription for the current workspace user.
 * HOW:   Validates the subscription payload with the shared contract and delegates the side effects to the notifications domain.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = pushSubscriptionInputSchema.safeParse(body);
    if (!parsed.success) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: parsed.error.issues[0]?.message ?? "Invalid push subscription",
        status: 400,
      });
    }

    await updateWorkspaceNotificationPreferences({ browserPushEnabled: true });
    await registerWorkspacePushSubscription(parsed.data);
    return Response.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

/**
 * WHY:   Push subscriptions need an authenticated remove path for stale browser endpoints.
 * WHAT:  Removes one registered push endpoint for the current workspace user.
 * HOW:   Parses the request body, validates the endpoint field, then delegates to the notifications domain service.
 */
export async function DELETE(request: Request) {
  try {
    const body = (await request.json()) as { endpoint?: string };
    if (!body.endpoint) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "endpoint is required",
        status: 400,
      });
    }

    await removeWorkspacePushSubscription(body.endpoint);
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return toInvalidJsonResponse();
    }
    return toErrorResponse(error);
  }
}

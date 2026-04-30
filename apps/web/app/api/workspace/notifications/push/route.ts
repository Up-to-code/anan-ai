import { createdResponse, handleRoute, jsonResponse, okResponse, parseJsonBody, readJsonBody } from "@anan/web-foundation/api";
import {
  getWorkspacePushConfig,
  registerWorkspacePushSubscription,
  removeWorkspacePushSubscription,
  updateWorkspaceNotificationPreferences,
} from "@/server/domains/workspace/notifications/service";
import { pushSubscriptionInputSchema } from "@/server/contracts/notifications";
import { DomainError } from "@/server/contracts/errors";

/**
 * WHY:   Push onboarding needs one read endpoint for browser configuration and current preference state.
 * WHAT:  Returns the current workspace push notification configuration.
 * HOW:   Delegates to the notifications domain service and serializes normalized failures.
 */
export async function GET() {
  return handleRoute(async () => jsonResponse(await getWorkspacePushConfig()));
}

/**
 * WHY:   Browser push registration should remain behind a single authenticated gateway mutation.
 * WHAT:  Enables browser push preferences and registers a subscription for the current workspace user.
 * HOW:   Validates the subscription payload with the shared contract and delegates the side effects to the notifications domain.
 */
export async function POST(request: Request) {
  return handleRoute(async () => {
    const subscription = await parseJsonBody(request, pushSubscriptionInputSchema, "Invalid push subscription");
    await updateWorkspaceNotificationPreferences({ browserPushEnabled: true });
    await registerWorkspacePushSubscription(subscription);
    return createdResponse({ ok: true });
  });
}

/**
 * WHY:   Push subscriptions need an authenticated remove path for stale browser endpoints.
 * WHAT:  Removes one registered push endpoint for the current workspace user.
 * HOW:   Parses the request body, validates the endpoint field, then delegates to the notifications domain service.
 */
export async function DELETE(request: Request) {
  return handleRoute(async () => {
    const body = await readJsonBody<{ endpoint?: string }>(request);
    if (!body.endpoint) {
      throw new DomainError({
        code: "INVALID_ARGUMENT",
        message: "endpoint is required",
        status: 400,
      });
    }

    await removeWorkspacePushSubscription(body.endpoint);
    return okResponse();
  });
}

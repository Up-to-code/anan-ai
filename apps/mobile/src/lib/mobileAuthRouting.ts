import type { MobileAuthLaunchRoute, MobileAuthReturnTarget } from "@/types/mobile";

/**
 * WHY:   Buyer launch routing now depends on guest dismissal, onboarding, and live auth state instead of onboarding alone.
 * WHAT:  Resolves the first mobile route the buyer should see after hydration.
 * HOW:   Prioritizes the auth entry for unsigned users who never skipped it, then falls back to the assistant home.
 */
export function resolveBuyerLaunchRoute({
  isAuthenticated,
  authEntryDismissedAt,
  isOnboardingComplete,
}: {
  isAuthenticated: boolean;
  authEntryDismissedAt?: number;
  isOnboardingComplete: boolean;
}): MobileAuthLaunchRoute {
  if (!isAuthenticated && !authEntryDismissedAt) {
    return "/auth";
  }

  return "/";
}

/**
 * WHY:   Auth screens can be opened either as the launch gate or as a later account-linking action.
 * WHAT:  Resolves where to send the user after authentication succeeds.
 * HOW:   Honors the originating route only after onboarding is complete so first-run users still land in the assistant home.
 */
export function resolvePostAuthRoute({
  returnTo,
  isOnboardingComplete,
}: {
  returnTo?: MobileAuthReturnTarget | null;
  isOnboardingComplete: boolean;
}) {
  if (!isOnboardingComplete) {
    return "/";
  }

  return sanitizeReturnTarget(returnTo) ?? "/";
}

/**
 * WHY:   The guest skip action should feel deterministic and never strand the user inside the auth stack.
 * WHAT:  Returns the correct route after continuing as guest.
 * HOW:   Mirrors the launch routing but skips the auth gate because the dismissal flag has just been recorded.
 */
export function resolvePostGuestRoute(isOnboardingComplete: boolean): "/" {
  return "/";
}

function sanitizeReturnTarget(returnTo?: MobileAuthReturnTarget | null) {
  if (!returnTo || typeof returnTo !== "string") return null;
  if (!returnTo.startsWith("/")) return null;
  if (returnTo.startsWith("/auth")) return null;
  return returnTo;
}

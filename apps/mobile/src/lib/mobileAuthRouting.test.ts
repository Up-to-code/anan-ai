import { describe, expect, it } from "vitest";
import { resolveBuyerLaunchRoute, resolvePostAuthRoute, resolvePostGuestRoute } from "@/lib/mobileAuthRouting";

describe("mobile auth routing", () => {
  it("sends unsigned first-run buyers into auth first", () => {
    expect(
      resolveBuyerLaunchRoute({
        isAuthenticated: false,
        authEntryDismissedAt: undefined,
        isOnboardingComplete: false,
      }),
    ).toBe("/auth");
  });

  it("keeps skipped guests in the assistant home until onboarding is complete", () => {
    expect(
      resolveBuyerLaunchRoute({
        isAuthenticated: false,
        authEntryDismissedAt: Date.now(),
        isOnboardingComplete: false,
      }),
    ).toBe("/");
  });

  it("returns authenticated onboarded users to their initiating screen when allowed", () => {
    expect(
      resolvePostAuthRoute({
        returnTo: "/account",
        isOnboardingComplete: true,
      }),
    ).toBe("/account");
  });

  it("forces unfinished onboarding through the assistant home before honoring return routes", () => {
    expect(
      resolvePostAuthRoute({
        returnTo: "/account",
        isOnboardingComplete: false,
      }),
    ).toBe("/");
  });

  it("mirrors guest continuation into the assistant home", () => {
    expect(resolvePostGuestRoute(false)).toBe("/");
    expect(resolvePostGuestRoute(true)).toBe("/");
  });
});

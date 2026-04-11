import { describe, expect, it } from "vitest";
import { resolveClerkPublishableKey, resolveConvexSiteUrl } from "@/lib/mobileEnv.shared";

describe("resolveClerkPublishableKey", () => {
  it("prefers EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY when both values exist", () => {
    expect(
      resolveClerkPublishableKey({
        expoPublicClerkPublishableKey: "pk_live_preferred",
        clerkPublishableKey: "pk_live_legacy",
      }),
    ).toBe("pk_live_preferred");
  });

  it("falls back to CLERK_PUBLISHABLE_KEY when the Expo public key is missing", () => {
    expect(
      resolveClerkPublishableKey({
        expoPublicClerkPublishableKey: "   ",
        clerkPublishableKey: "pk_live_legacy",
      }),
    ).toBe("pk_live_legacy");
  });

  it("returns null when neither supported key is populated", () => {
    expect(
      resolveClerkPublishableKey({
        expoPublicClerkPublishableKey: "",
        clerkPublishableKey: null,
      }),
    ).toBeNull();
  });
});

describe("resolveConvexSiteUrl", () => {
  it("prefers EXPO_PUBLIC_CONVEX_SITE_URL when present", () => {
    expect(
      resolveConvexSiteUrl({
        expoPublicConvexUrl: "https://demo.convex.cloud",
        expoPublicConvexSiteUrl: "https://demo.convex.site",
      }),
    ).toBe("https://demo.convex.site");
  });

  it("derives the site URL from the main Convex URL when the explicit site URL is missing", () => {
    expect(
      resolveConvexSiteUrl({
        expoPublicConvexUrl: "https://keen-oyster-497.eu-west-1.convex.cloud",
      }),
    ).toBe("https://keen-oyster-497.eu-west-1.convex.site");
  });
});

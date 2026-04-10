import { describe, expect, it } from "vitest";
import { resolveClerkPublishableKey } from "@/lib/mobileEnv.shared";

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

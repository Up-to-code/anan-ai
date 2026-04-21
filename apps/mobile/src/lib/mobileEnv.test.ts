import { describe, expect, it } from "vitest";
import { resolveConvexSiteUrl } from "@/lib/mobileEnv.shared";

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

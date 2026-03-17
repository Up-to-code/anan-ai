import { describe, expect, it } from "vitest";
import { resolveConvexAuthIssuer } from "./authIssuer";

describe("resolveConvexAuthIssuer", () => {
  it("normalizes the configured Convex issuer URL", () => {
    const issuer = resolveConvexAuthIssuer({
      env: { CONVEX_SITE_URL: "my-deployment.convex.site", NODE_ENV: "production" },
    });
    expect(issuer).toBe("https://my-deployment.convex.site");
  });

  it("rejects unresolved issuer values in non-test environments", () => {
    expect(() =>
      resolveConvexAuthIssuer({
        env: { CONVEX_SITE_URL: undefined, NODE_ENV: "production" },
      }))
      .toThrow("CONVEX_SITE_URL must be set");
  });

  it("rejects placeholder issuer values in non-test environments", () => {
    expect(() =>
      resolveConvexAuthIssuer({
        env: { CONVEX_SITE_URL: "https://example.convex.site", NODE_ENV: "production" },
      }))
      .toThrow("CONVEX_SITE_URL must be set");
  });
});


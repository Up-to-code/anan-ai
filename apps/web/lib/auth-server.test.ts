import { describe, expect, it } from "vitest";
import { resolveAuthBridgeConfig } from "./auth-server";

describe("resolveAuthBridgeConfig", () => {
  it("keeps localhost defaults for local development", () => {
    expect(
      resolveAuthBridgeConfig({
        NODE_ENV: "development",
        VERCEL_ENV: "development",
      }),
    ).toEqual({
      convexUrl: "http://localhost:3210",
      convexSiteUrl: "http://localhost:3211",
      isConfigured: true,
    });
  });

  it("uses hosted convex envs in production", () => {
    expect(
      resolveAuthBridgeConfig({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_CONVEX_URL: "https://bright-fox-123.convex.cloud",
      }),
    ).toEqual({
      convexUrl: "https://bright-fox-123.convex.cloud",
      convexSiteUrl: "https://bright-fox-123.convex.site",
      isConfigured: true,
    });
  });

  it("prefers runtime server envs over stale public envs", () => {
    expect(
      resolveAuthBridgeConfig({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        CONVEX_URL: "https://charming-pika-586.eu-west-1.convex.cloud",
        CONVEX_SITE_URL: "https://charming-pika-586.eu-west-1.convex.site",
        NEXT_PUBLIC_CONVEX_URL: "https://keen-oyster-497.eu-west-1.convex.cloud",
        NEXT_PUBLIC_CONVEX_SITE_URL: "https://keen-oyster-497.eu-west-1.convex.site",
      }),
    ).toEqual({
      convexUrl: "https://charming-pika-586.eu-west-1.convex.cloud",
      convexSiteUrl: "https://charming-pika-586.eu-west-1.convex.site",
      isConfigured: true,
    });
  });

  it("ignores localhost envs in production", () => {
    expect(
      resolveAuthBridgeConfig({
        NODE_ENV: "production",
        VERCEL_ENV: "production",
        NEXT_PUBLIC_CONVEX_URL: "http://localhost:3210",
        CONVEX_SITE_URL: "http://localhost:3211",
      }),
    ).toEqual({
      convexUrl: "http://localhost:3210",
      convexSiteUrl: "http://localhost:3211",
      isConfigured: false,
    });
  });
});

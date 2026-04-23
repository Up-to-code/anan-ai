import { describe, expect, it } from "vitest";
import {
  buildAuthErrorRedirectUrl,
  isLoopbackOrigin,
  isProductionLikeEnv,
  resolveAllowedOrigins,
  resolveAppRedirectBaseUrl,
} from "./authRedirects";

describe("isProductionLikeEnv", () => {
  it("treats vercel production deployments as production-like", () => {
    expect(isProductionLikeEnv("development", "production")).toBe(true);
  });

  it("keeps local development false", () => {
    expect(isProductionLikeEnv("development", "preview")).toBe(false);
  });
});

describe("isLoopbackOrigin", () => {
  it("recognizes localhost urls", () => {
    expect(isLoopbackOrigin("http://localhost:3000")).toBe(true);
    expect(isLoopbackOrigin("http://127.0.0.1:3000")).toBe(true);
  });

  it("does not flag hosted origins", () => {
    expect(isLoopbackOrigin("https://anan-lit-web.vercel.app")).toBe(false);
  });
});

describe("resolveAllowedOrigins", () => {
  it("adds localhost defaults outside production", () => {
    const origins = resolveAllowedOrigins({
      webBaseUrl: "https://web.example.com",
      nodeEnv: "development",
    });

    expect(origins).toContain("https://web.example.com");
    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("http://127.0.0.1:3000");
    expect(origins).toContain("http://localhost:3001");
    expect(origins).toContain("http://127.0.0.1:3001");
  });

  it("does not add localhost defaults in production", () => {
    const origins = resolveAllowedOrigins({
      webBaseUrl: "https://web.example.com",
      nodeEnv: "production",
    });

    expect(origins).toContain("https://web.example.com");
    expect(origins).not.toContain("http://localhost:3000");
    expect(origins).not.toContain("http://127.0.0.1:3000");
    expect(origins).not.toContain("http://localhost:3001");
    expect(origins).not.toContain("http://127.0.0.1:3001");
  });

  it("adds explicit extra origins", () => {
    const origins = resolveAllowedOrigins({
      webBaseUrl: "https://web.example.com",
      extraOrigins: ["https://admin.example.com"],
      nodeEnv: "production",
    });

    expect(origins).toContain("https://web.example.com");
    expect(origins).toContain("https://admin.example.com");
  });
});

describe("resolveAppRedirectBaseUrl", () => {
  it("preserves localhost web origins for dev Convex deployments even when NODE_ENV is production", () => {
    expect(resolveAppRedirectBaseUrl({
      ananWebUrl: "http://localhost:3000",
      nodeEnv: "production",
      vercelEnv: "preview",
    })).toBe("http://localhost:3000");
  });

  it("uses the hosted Vercel URL in production and ignores localhost", () => {
    expect(resolveAppRedirectBaseUrl({
      ananWebUrl: "http://localhost:3000",
      vercelUrl: "anan-lit-web.vercel.app",
      nodeEnv: "production",
      vercelEnv: "production",
    })).toBe("https://anan-lit-web.vercel.app");
  });

  it("falls back to localhost when no app URL is configured outside production", () => {
    expect(resolveAppRedirectBaseUrl({
      nodeEnv: "production",
      vercelEnv: "preview",
    })).toBe("http://localhost:3000");
  });
});

describe("buildAuthErrorRedirectUrl", () => {
  it("returns auth errors to the workspace sign-in target", () => {
    expect(buildAuthErrorRedirectUrl("http://localhost:3000", {
      error: "state_mismatch",
      returnTo: "/ws",
    })).toBe("http://localhost:3000/signin?returnTo=%2Fws&error=state_mismatch");
  });
});

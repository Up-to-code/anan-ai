import { describe, expect, it } from "vitest";
import { isLoopbackOrigin, isProductionLikeEnv, resolveAllowedOrigins } from "./authRedirects";

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

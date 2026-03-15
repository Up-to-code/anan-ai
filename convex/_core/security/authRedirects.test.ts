import { describe, expect, it } from "vitest";
import { resolveAllowedOrigins } from "./authRedirects";

describe("resolveAllowedOrigins", () => {
  it("adds localhost defaults outside production", () => {
    const origins = resolveAllowedOrigins({
      webBaseUrl: "https://web.example.com",
      nodeEnv: "development",
    });

    expect(origins).toContain("https://web.example.com");
    expect(origins).toContain("http://localhost:3000");
    expect(origins).toContain("http://127.0.0.1:3000");
  });

  it("does not add localhost defaults in production", () => {
    const origins = resolveAllowedOrigins({
      webBaseUrl: "https://web.example.com",
      nodeEnv: "production",
    });

    expect(origins).toContain("https://web.example.com");
    expect(origins).not.toContain("http://localhost:3000");
    expect(origins).not.toContain("http://127.0.0.1:3000");
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

import { afterEach, describe, expect, it } from "vitest";
import { parseOAuthSourceApp, resolveOAuthConsentBaseUrl } from "./consentRouting";

const ENV_KEYS = ["ANAN_WEB_URL", "ANAN_ADMIN_URL", "SITE_URL"] as const;
const envSnapshot = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function restoreEnv() {
  for (const key of ENV_KEYS) {
    const value = envSnapshot[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

describe("OAuth consent routing", () => {
  afterEach(() => {
    restoreEnv();
  });

  it("parses only known source app values", () => {
    expect(parseOAuthSourceApp("admin")).toBe("admin");
    expect(parseOAuthSourceApp("WEB")).toBe("web");
    expect(parseOAuthSourceApp("unknown")).toBeNull();
  });

  it("resolves the consent base URL using app-specific envs", () => {
    process.env.ANAN_WEB_URL = "https://web.anan.local";
    process.env.ANAN_ADMIN_URL = "https://admin.anan.local";
    const request = new Request("https://convex.anan.local/oauth/authorize");

    expect(resolveOAuthConsentBaseUrl(request, "admin")).toBe("https://admin.anan.local");
    expect(resolveOAuthConsentBaseUrl(request, "web")).toBe("https://web.anan.local");
  });

  it("falls back to the web base URL when the app origin is missing", () => {
    process.env.ANAN_WEB_URL = "https://web.anan.local";
    const request = new Request("https://convex.anan.local/oauth/authorize");

    expect(resolveOAuthConsentBaseUrl(request, "admin")).toBe("https://web.anan.local");
  });

  it("falls back to the request origin when no web base URL is set", () => {
    const request = new Request("https://convex.anan.local/oauth/authorize");

    expect(resolveOAuthConsentBaseUrl(request, "web")).toBe("https://convex.anan.local");
  });
});

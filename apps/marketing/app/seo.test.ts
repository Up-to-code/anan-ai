import { describe, expect, it } from "vitest";
import robots from "./robots";
import sitemap from "./sitemap";

describe("marketing SEO routes", () => {
  it("keeps workspace and assistant urls out of the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);

    expect(urls).toContain("http://localhost:3002/ar");
    expect(urls).toContain("http://localhost:3002/en");
    expect(urls).toContain("http://localhost:3002/fr");
    expect(urls.some((url) => url.includes("/signin"))).toBe(false);
    expect(urls.some((url) => url.includes("/app"))).toBe(false);
  });

  it("allows marketing routes and blocks api routes in robots", () => {
    const definition = robots();

    expect(definition.rules).toEqual({
      userAgent: "*",
      allow: expect.arrayContaining(["/ar", "/en", "/fr"]),
      disallow: ["/api/"],
    });
  });
});

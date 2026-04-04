import { expect, it } from "vitest";
import { getOrganizationApiKeyOrigin } from "./_shared";

it("returns the trimmed origin header when present", () => {
  const request = new Request("http://localhost/api/org/clients", {
    headers: { Origin: " https://app.anan.test " },
  });

  expect(getOrganizationApiKeyOrigin(request)).toBe("https://app.anan.test");
});

it("falls back to the referer origin when origin is missing", () => {
  const request = new Request("http://localhost/api/org/clients", {
    headers: { Referer: "https://workspace.anan.test/path?tab=clients" },
  });

  expect(getOrganizationApiKeyOrigin(request)).toBe("https://workspace.anan.test");
});

it("returns undefined when no browser origin headers are present", () => {
  const request = new Request("http://localhost/api/org/clients");

  expect(getOrganizationApiKeyOrigin(request)).toBeUndefined();
});

it("returns undefined when referer is invalid", () => {
  const request = new Request("http://localhost/api/org/clients", {
    headers: { Referer: "not a url" },
  });

  expect(getOrganizationApiKeyOrigin(request)).toBeUndefined();
});

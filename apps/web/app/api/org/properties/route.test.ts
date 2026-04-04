import { beforeEach, expect, it, vi } from "vitest";

const {
  listOrganizationPropertiesByApiKey,
  createOrganizationPropertyByApiKey,
} = vi.hoisted(() => ({
  listOrganizationPropertiesByApiKey: vi.fn(),
  createOrganizationPropertyByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listOrganizationPropertiesByApiKey,
  createOrganizationPropertyByApiKey,
}));

import { GET, POST } from "./route";

beforeEach(() => {
  listOrganizationPropertiesByApiKey.mockReset();
  createOrganizationPropertyByApiKey.mockReset();
});

it("lists properties using the api key header", async () => {
  listOrganizationPropertiesByApiKey.mockResolvedValue([{ id: "property-1", title: "Property" }]);

  const response = await GET(new Request("http://localhost/api/org/properties", { headers: { "X-Anan-Api-Key": "secret-key" } }));

  expect(response.status).toBe(200);
  expect(listOrganizationPropertiesByApiKey).toHaveBeenCalledWith("secret-key", undefined);
});

it("creates a property using the api key header", async () => {
  createOrganizationPropertyByApiKey.mockResolvedValue({ id: "property-1", title: "Property" });

  const response = await POST(new Request("http://localhost/api/org/properties", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ title: "Property" }),
  }));

  expect(response.status).toBe(201);
  expect(createOrganizationPropertyByApiKey).toHaveBeenCalledWith("secret-key", { title: "Property" }, undefined);
});

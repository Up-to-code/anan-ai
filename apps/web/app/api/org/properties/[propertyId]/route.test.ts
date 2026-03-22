import { beforeEach, expect, it, vi } from "vitest";

const {
  updateOrganizationPropertyByApiKey,
  deleteOrganizationPropertyByApiKey,
} = vi.hoisted(() => ({
  updateOrganizationPropertyByApiKey: vi.fn(),
  deleteOrganizationPropertyByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  updateOrganizationPropertyByApiKey,
  deleteOrganizationPropertyByApiKey,
}));

import { DELETE, PATCH } from "./route";

beforeEach(() => {
  updateOrganizationPropertyByApiKey.mockReset();
  deleteOrganizationPropertyByApiKey.mockReset();
});

it("updates a property by id", async () => {
  updateOrganizationPropertyByApiKey.mockResolvedValue({ id: "property-1", title: "Updated" });

  const response = await PATCH(new Request("http://localhost/api/org/properties/property-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ title: "Updated" }),
  }), { params: Promise.resolve({ propertyId: "property-1" }) });

  expect(response.status).toBe(200);
  expect(updateOrganizationPropertyByApiKey).toHaveBeenCalledWith("secret-key", "property-1", { title: "Updated" });
});

it("deletes a property by id", async () => {
  const response = await DELETE(new Request("http://localhost/api/org/properties/property-1", { headers: { "X-Anan-Api-Key": "secret-key" } }), {
    params: Promise.resolve({ propertyId: "property-1" }),
  });

  expect(response.status).toBe(200);
  expect(deleteOrganizationPropertyByApiKey).toHaveBeenCalledWith("secret-key", "property-1");
});

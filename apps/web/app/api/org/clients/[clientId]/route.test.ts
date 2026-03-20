import { beforeEach, expect, it, vi } from "vitest";

const {
  updateOrganizationClientByApiKey,
  deleteOrganizationClientByApiKey,
} = vi.hoisted(() => ({
  updateOrganizationClientByApiKey: vi.fn(),
  deleteOrganizationClientByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/organizationApiKeys/service", () => ({
  updateOrganizationClientByApiKey,
  deleteOrganizationClientByApiKey,
}));

import { DELETE, PATCH } from "./route";

beforeEach(() => {
  updateOrganizationClientByApiKey.mockReset();
  deleteOrganizationClientByApiKey.mockReset();
});

it("updates a client by id", async () => {
  updateOrganizationClientByApiKey.mockResolvedValue({ id: "client-1", name: "Updated" });

  const response = await PATCH(new Request("http://localhost/api/org/clients/client-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ name: "Updated" }),
  }), { params: Promise.resolve({ clientId: "client-1" }) });

  expect(response.status).toBe(200);
  expect(updateOrganizationClientByApiKey).toHaveBeenCalledWith("secret-key", "client-1", { name: "Updated" });
});

it("deletes a client by id", async () => {
  const response = await DELETE(new Request("http://localhost/api/org/clients/client-1", { headers: { "X-Anan-Api-Key": "secret-key" } }), {
    params: Promise.resolve({ clientId: "client-1" }),
  });

  expect(response.status).toBe(200);
  expect(deleteOrganizationClientByApiKey).toHaveBeenCalledWith("secret-key", "client-1");
});

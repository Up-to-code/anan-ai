import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  listOrganizationClientsByApiKey,
  createOrganizationClientByApiKey,
} = vi.hoisted(() => ({
  listOrganizationClientsByApiKey: vi.fn(),
  createOrganizationClientByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/organizationApiKeys/service", () => ({
  listOrganizationClientsByApiKey,
  createOrganizationClientByApiKey,
}));

import { GET, POST } from "./route";

beforeEach(() => {
  listOrganizationClientsByApiKey.mockReset();
  createOrganizationClientByApiKey.mockReset();
});

it("lists clients using the api key header", async () => {
  listOrganizationClientsByApiKey.mockResolvedValue([{ id: "client-1", name: "Client" }]);

  const response = await GET(new Request("http://localhost/api/org/clients", { headers: { "X-Anan-Api-Key": "secret-key" } }));

  expect(listOrganizationClientsByApiKey).toHaveBeenCalledWith("secret-key");
  await expect(response.json()).resolves.toEqual({ clients: [{ id: "client-1", name: "Client" }] });
});

it("creates a client using the api key header", async () => {
  createOrganizationClientByApiKey.mockResolvedValue({ id: "client-1", name: "Client" });

  const response = await POST(new Request("http://localhost/api/org/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ name: "Client" }),
  }));

  expect(response.status).toBe(201);
  expect(createOrganizationClientByApiKey).toHaveBeenCalledWith("secret-key", { name: "Client" });
});

it("serializes client create failures", async () => {
  createOrganizationClientByApiKey.mockRejectedValue(new DomainError({ code: "UNAUTHORIZED", message: "Invalid API key", status: 401 }));

  const response = await POST(new Request("http://localhost/api/org/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "bad-key" },
    body: JSON.stringify({ name: "Client" }),
  }));

  expect(response.status).toBe(401);
});

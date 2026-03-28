import { beforeEach, expect, it, vi } from "vitest";

const { listOrganizationBrokersByApiKey } = vi.hoisted(() => ({
  listOrganizationBrokersByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listOrganizationBrokersByApiKey,
}));

import { GET } from "./route";

beforeEach(() => {
  listOrganizationBrokersByApiKey.mockReset();
});

it("lists brokers using the api key header", async () => {
  listOrganizationBrokersByApiKey.mockResolvedValue([{ id: "broker-1", name: "Broker One" }]);

  const response = await GET(new Request("http://localhost/api/org/brokers", { headers: { "X-Anan-Api-Key": "secret-key" } }));

  expect(response.status).toBe(200);
  expect(listOrganizationBrokersByApiKey).toHaveBeenCalledWith("secret-key");
  await expect(response.json()).resolves.toEqual({ brokers: [{ id: "broker-1", name: "Broker One" }] });
});

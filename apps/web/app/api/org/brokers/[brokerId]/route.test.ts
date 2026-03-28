import { beforeEach, expect, it, vi } from "vitest";

const { getOrganizationBrokerByApiKey } = vi.hoisted(() => ({
  getOrganizationBrokerByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  getOrganizationBrokerByApiKey,
}));

import { GET } from "./route";

beforeEach(() => {
  getOrganizationBrokerByApiKey.mockReset();
});

it("gets a broker by id", async () => {
  getOrganizationBrokerByApiKey.mockResolvedValue({ id: "broker-1", name: "Broker One" });

  const response = await GET(new Request("http://localhost/api/org/brokers/broker-1", { headers: { "X-Anan-Api-Key": "secret-key" } }), {
    params: Promise.resolve({ brokerId: "broker-1" }),
  });

  expect(response.status).toBe(200);
  expect(getOrganizationBrokerByApiKey).toHaveBeenCalledWith("secret-key", "broker-1");
  await expect(response.json()).resolves.toEqual({ broker: { id: "broker-1", name: "Broker One" } });
});

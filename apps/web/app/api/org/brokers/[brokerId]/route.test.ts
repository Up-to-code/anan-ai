import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

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

it("gets a broker using the api key header", async () => {
  getOrganizationBrokerByApiKey.mockResolvedValue({ id: "broker-1", name: "Broker" });

  const response = await GET(new Request("http://localhost/api/org/brokers/broker-1", {
    headers: { "X-Anan-Api-Key": "secret-key" },
  }), { params: Promise.resolve({ brokerId: "broker-1" }) });

  expect(getOrganizationBrokerByApiKey).toHaveBeenCalledWith("secret-key", "broker-1");
  await expect(response.json()).resolves.toEqual({ broker: { id: "broker-1", name: "Broker" } });
});

it("serializes broker lookup failures", async () => {
  getOrganizationBrokerByApiKey.mockRejectedValue(new DomainError({ code: "NOT_FOUND", message: "Broker not found", status: 404 }));

  const response = await GET(new Request("http://localhost/api/org/brokers/broker-1", {
    headers: { "X-Anan-Api-Key": "secret-key" },
  }), { params: Promise.resolve({ brokerId: "broker-1" }) });

  expect(response.status).toBe(404);
});

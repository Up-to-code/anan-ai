import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  listOrganizationDealsByApiKey,
  createOrganizationDealByApiKey,
} = vi.hoisted(() => ({
  listOrganizationDealsByApiKey: vi.fn(),
  createOrganizationDealByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  listOrganizationDealsByApiKey,
  createOrganizationDealByApiKey,
}));

import { GET, POST } from "./route";

beforeEach(() => {
  listOrganizationDealsByApiKey.mockReset();
  createOrganizationDealByApiKey.mockReset();
});

it("lists deals using the api key header", async () => {
  listOrganizationDealsByApiKey.mockResolvedValue([{ id: "deal-1", title: "Deal" }]);

  const response = await GET(new Request("http://localhost/api/org/deals", { headers: { "X-Anan-Api-Key": "secret-key" } }));

  expect(listOrganizationDealsByApiKey).toHaveBeenCalledWith("secret-key");
  await expect(response.json()).resolves.toEqual({ deals: [{ id: "deal-1", title: "Deal" }] });
});

it("creates a deal using the api key header", async () => {
  createOrganizationDealByApiKey.mockResolvedValue({ id: "deal-1", title: "Deal" });

  const response = await POST(new Request("http://localhost/api/org/deals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ title: "Deal", stage: "new", relationType: "internal_client" }),
  }));

  expect(response.status).toBe(201);
  expect(createOrganizationDealByApiKey).toHaveBeenCalledWith("secret-key", { title: "Deal", stage: "new", relationType: "internal_client" });
});

it("serializes deal create failures", async () => {
  createOrganizationDealByApiKey.mockRejectedValue(new DomainError({ code: "UNAUTHORIZED", message: "Invalid API key", status: 401 }));

  const response = await POST(new Request("http://localhost/api/org/deals", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "bad-key" },
    body: JSON.stringify({ title: "Deal", stage: "new", relationType: "internal_client" }),
  }));

  expect(response.status).toBe(401);
});

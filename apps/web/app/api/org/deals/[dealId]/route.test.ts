import { beforeEach, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

const {
  updateOrganizationDealByApiKey,
  deleteOrganizationDealByApiKey,
} = vi.hoisted(() => ({
  updateOrganizationDealByApiKey: vi.fn(),
  deleteOrganizationDealByApiKey: vi.fn(),
}));

vi.mock("@/server/domains/auth/organizationApiKeys/service", () => ({
  updateOrganizationDealByApiKey,
  deleteOrganizationDealByApiKey,
}));

import { DELETE, PATCH } from "./route";

beforeEach(() => {
  updateOrganizationDealByApiKey.mockReset();
  deleteOrganizationDealByApiKey.mockReset();
});

it("updates a deal using the api key header", async () => {
  updateOrganizationDealByApiKey.mockResolvedValue({ id: "deal-1", title: "Updated Deal" });

  const response = await PATCH(new Request("http://localhost/api/org/deals/deal-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ title: "Updated Deal" }),
  }), { params: Promise.resolve({ dealId: "deal-1" }) });

  expect(updateOrganizationDealByApiKey).toHaveBeenCalledWith("secret-key", "deal-1", { title: "Updated Deal" });
  await expect(response.json()).resolves.toEqual({ deal: { id: "deal-1", title: "Updated Deal" } });
});

it("deletes a deal using the api key header", async () => {
  const response = await DELETE(new Request("http://localhost/api/org/deals/deal-1", {
    method: "DELETE",
    headers: { "X-Anan-Api-Key": "secret-key" },
  }), { params: Promise.resolve({ dealId: "deal-1" }) });

  expect(deleteOrganizationDealByApiKey).toHaveBeenCalledWith("secret-key", "deal-1");
  expect(response.status).toBe(200);
});

it("serializes delete failures", async () => {
  deleteOrganizationDealByApiKey.mockRejectedValue(new DomainError({ code: "NOT_FOUND", message: "Deal not found", status: 404 }));

  const response = await DELETE(new Request("http://localhost/api/org/deals/deal-1", {
    method: "DELETE",
    headers: { "X-Anan-Api-Key": "secret-key" },
  }), { params: Promise.resolve({ dealId: "deal-1" }) });

  expect(response.status).toBe(404);
});

import { beforeEach, expect, it, vi } from "vitest";

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

it("updates a deal by id", async () => {
  updateOrganizationDealByApiKey.mockResolvedValue({ id: "deal-1", title: "Updated", stage: "won" });

  const response = await PATCH(new Request("http://localhost/api/org/deals/deal-1", {
    method: "PATCH",
    headers: { "Content-Type": "application/json", "X-Anan-Api-Key": "secret-key" },
    body: JSON.stringify({ stage: "won" }),
  }), { params: Promise.resolve({ dealId: "deal-1" }) });

  expect(response.status).toBe(200);
  expect(updateOrganizationDealByApiKey).toHaveBeenCalledWith("secret-key", "deal-1", { stage: "won" }, undefined);
});

it("deletes a deal by id", async () => {
  const response = await DELETE(new Request("http://localhost/api/org/deals/deal-1", { headers: { "X-Anan-Api-Key": "secret-key" } }), {
    params: Promise.resolve({ dealId: "deal-1" }),
  });

  expect(response.status).toBe(200);
  expect(deleteOrganizationDealByApiKey).toHaveBeenCalledWith("secret-key", "deal-1", undefined);
});

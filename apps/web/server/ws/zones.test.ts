import { expect, it, vi } from "vitest";

const { requireSessionContext } = vi.hoisted(() => ({
  requireSessionContext: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

vi.mock("@/server/domains/workspace/properties/broker", () => ({
  listBrokerProperties: vi.fn(),
  getBrokerProperty: vi.fn(),
  createBrokerProperty: vi.fn(),
  updateBrokerProperty: vi.fn(),
  deleteBrokerProperty: vi.fn(),
  publishBrokerProperty: vi.fn(),
  applyToBrokerOffer: vi.fn(),
  createBrokerOffer: vi.fn(),
  getBrokerOffersSnapshot: vi.fn(),
  publishBrokerOffer: vi.fn(),
  respondToBrokerOffer: vi.fn(),
  addBrokerDealDocument: vi.fn(),
  createBrokerDeal: vi.fn(),
  listBrokerDeals: vi.fn(),
  updateBrokerDealFollowUp: vi.fn(),
  updateBrokerDealNotes: vi.fn(),
  updateBrokerDealStage: vi.fn(),
}));

vi.mock("@/server/domains/workspace/properties/developer", () => ({
  listRedProperties: vi.fn(),
  getRedProperty: vi.fn(),
  createRedProperty: vi.fn(),
  updateRedProperty: vi.fn(),
  deleteRedProperty: vi.fn(),
  publishRedProperty: vi.fn(),
}));

vi.mock("@/server/domains/workspace/offers/broker", () => ({
  applyToBrokerOffer: vi.fn(),
  createBrokerOffer: vi.fn(),
  getBrokerOffersSnapshot: vi.fn(),
  publishBrokerOffer: vi.fn(),
  respondToBrokerOffer: vi.fn(),
}));

vi.mock("@/server/domains/workspace/offers/developer", () => ({
  applyToRedOffer: vi.fn(),
  createRedOffer: vi.fn(),
  getRedOffersSnapshot: vi.fn(),
  publishRedOffer: vi.fn(),
  respondToRedOffer: vi.fn(),
}));

vi.mock("@/server/domains/workspace/crm/broker", () => ({
  addBrokerDealDocument: vi.fn(),
  createBrokerDeal: vi.fn(),
  listBrokerDeals: vi.fn(),
  updateBrokerDealNotes: vi.fn(),
  updateBrokerDealStage: vi.fn(),
}));

vi.mock("@/server/domains/workspace/crm/developer", () => ({
  addRedDealDocument: vi.fn(),
  createRedDeal: vi.fn(),
  listRedDeals: vi.fn(),
  updateRedDealFollowUp: vi.fn(),
  updateRedDealNotes: vi.fn(),
  updateRedDealStage: vi.fn(),
}));
import { getWorkspaceCrmZone, getWorkspaceOffersZone, getWorkspacePropertyZone } from "./zones";
import { listBrokerProperties } from "@/server/domains/workspace/properties/broker";

it("selects broker property functions", () => {
  const zone = getWorkspacePropertyZone("broker");
  expect(typeof zone.listProperties).toBe("function");
  expect(typeof zone.createProperty).toBe("function");
});

it("selects developer offer functions", () => {
  const zone = getWorkspaceOffersZone("developer");
  expect(typeof zone.getSnapshot).toBe("function");
  expect(typeof zone.publishOffer).toBe("function");
});

it("selects broker crm functions", () => {
  const zone = getWorkspaceCrmZone("broker");
  expect(typeof zone.listDeals).toBe("function");
  expect(typeof zone.updateDealStage).toBe("function");
});

it("injects broker owner context into the workspace-scoped session resolver", async () => {
  requireSessionContext.mockResolvedValue({
    token: "token-1",
    profile: null,
    context: {
      userId: "user-1",
      role: "user",
      isActive: true,
    },
  });

  const zone = getWorkspacePropertyZone("broker", {
    ownerType: "broker",
    ownerId: "broker-1",
  });

  await zone.listProperties({ paginationOpts: { cursor: null, numItems: 20 } });

  expect(listBrokerProperties).toHaveBeenCalledTimes(1);
  const dependencies = vi.mocked(listBrokerProperties).mock.calls[0]?.[1];
  const session = await dependencies?.requireSession();

  expect(session?.context.role).toBe("broker");
  expect(session?.context.brokerId).toBe("broker-1");
});

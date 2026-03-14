import { describe, expect, it, vi } from "vitest";

const { requireSessionContext } = vi.hoisted(() => ({
  requireSessionContext: vi.fn(),
}));

vi.mock("@/server/auth/session", () => ({
  requireSessionContext,
}));

vi.mock("@/server/broker_zone/properties", () => ({
  listBrokerProperties: vi.fn(),
  getBrokerProperty: vi.fn(),
  createBrokerProperty: vi.fn(),
  updateBrokerProperty: vi.fn(),
  deleteBrokerProperty: vi.fn(),
  publishBrokerProperty: vi.fn(),
}));

vi.mock("@/server/red_zone/properties", () => ({
  listRedProperties: vi.fn(),
  getRedProperty: vi.fn(),
  createRedProperty: vi.fn(),
  updateRedProperty: vi.fn(),
  deleteRedProperty: vi.fn(),
  publishRedProperty: vi.fn(),
}));

vi.mock("@/server/broker_zone/offers", () => ({
  applyToBrokerOffer: vi.fn(),
  createBrokerOffer: vi.fn(),
  getBrokerOffersSnapshot: vi.fn(),
  publishBrokerOffer: vi.fn(),
  respondToBrokerOffer: vi.fn(),
}));

vi.mock("@/server/red_zone/offers", () => ({
  applyToRedOffer: vi.fn(),
  createRedOffer: vi.fn(),
  getRedOffersSnapshot: vi.fn(),
  publishRedOffer: vi.fn(),
  respondToRedOffer: vi.fn(),
}));

vi.mock("@/server/broker_zone/crm", () => ({
  addBrokerDealDocument: vi.fn(),
  createBrokerDeal: vi.fn(),
  listBrokerDeals: vi.fn(),
  updateBrokerDealNotes: vi.fn(),
  updateBrokerDealStage: vi.fn(),
}));

vi.mock("@/server/red_zone/crm", () => ({
  addRedDealDocument: vi.fn(),
  createRedDeal: vi.fn(),
  listRedDeals: vi.fn(),
  updateRedDealNotes: vi.fn(),
  updateRedDealStage: vi.fn(),
}));
import { getWorkspaceCrmZone, getWorkspaceOffersZone, getWorkspacePropertyZone } from "./zones";
import { listBrokerProperties } from "@/server/broker_zone/properties";

describe("workspace zone dispatch", () => {
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
});

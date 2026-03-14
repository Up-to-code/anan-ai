import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getBrokerOffersSnapshot } from "./index";

describe("broker offers server functions", () => {
  it("loads the broker offers snapshot after session validation", async () => {
    const repository = {
      listSent: vi.fn(async () => []),
      listReceived: vi.fn(async () => [{ id: "offer-2", propertyId: "property-1", price: 1, status: "pending" as const }]),
      listMarketplace: vi.fn(async () => []),
      create: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
      publish: vi.fn(async () => ({ ok: true as const })),
      respond: vi.fn(async () => undefined),
      apply: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
    };

    const snapshot = await getBrokerOffersSnapshot({
      requireBroker: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "broker", brokerId: "broker-1", isActive: true },
        profile: null,
      })),
      repository,
    });

    expect(snapshot.received).toHaveLength(1);
    expect(repository.listSent).toHaveBeenCalled();
    expect(repository.listReceived).toHaveBeenCalled();
    expect(repository.listMarketplace).toHaveBeenCalled();
  });
});

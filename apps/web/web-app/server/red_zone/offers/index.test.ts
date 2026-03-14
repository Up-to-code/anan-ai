import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getRedOffersSnapshot } from "./index";

describe("red offers server functions", () => {
  it("loads the developer offers snapshot after session validation", async () => {
    const repository = {
      listSent: vi.fn(async () => [{ id: "offer-1", propertyId: "property-1", price: 1, status: "pending" as const }]),
      listReceived: vi.fn(async () => []),
      listMarketplace: vi.fn(async () => []),
      create: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
      publish: vi.fn(async () => ({ ok: true as const })),
      respond: vi.fn(async () => undefined),
      apply: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
    };

    const snapshot = await getRedOffersSnapshot({
      requireDeveloper: vi.fn(async () => ({
        token: "token",
        context: { userId: "user-1", role: "developer", redId: "red-1", isActive: true },
        profile: null,
      })),
      repository,
    });

    expect(snapshot.sent).toHaveLength(1);
    expect(repository.listSent).toHaveBeenCalled();
    expect(repository.listReceived).toHaveBeenCalled();
    expect(repository.listMarketplace).toHaveBeenCalled();
  });
});

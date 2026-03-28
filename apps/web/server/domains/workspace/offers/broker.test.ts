import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { archiveBrokerOffer, getBrokerOffersSnapshot, updateBrokerOfferDraft } from "./broker";

describe("broker offers server functions", () => {
  it("loads the broker offers snapshot after session validation", async () => {
    const repository = {
      getQueues: vi.fn(async () => ({
        audience: "broker" as const,
        queues: [
          {
            key: "incoming_opportunities" as const,
            label: "Incoming Opportunities",
            description: "Open opportunities and targeted requests visible to you.",
            items: [{ id: "offer-2", propertyId: "property-1", price: 1, status: "pending" as const }],
          },
        ],
        sent: [],
        received: [{ id: "offer-2", propertyId: "property-1", price: 1, status: "pending" as const }],
        marketplace: [],
      })),
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
    expect(repository.getQueues).toHaveBeenCalledWith("token");
  });

  it("updates only owner-editable drafts", async () => {
    const repository = {
      getOfferLiveState: vi.fn(async () => ({
        id: "offer-1",
        propertyId: "property-1",
        price: 100,
        status: "pending" as const,
        publicationState: "draft" as const,
        href: "/ws/offers/offer-1",
        propertyTitle: "Villa",
        propertyAddress: "Riyadh",
        isOwner: true,
        isRecipient: false,
        canEditDraft: true,
        canPublish: true,
        canArchive: true,
        canRespond: false,
      })),
      updateDraft: vi.fn(async () => ({ ok: true as const })),
    };

    await updateBrokerOfferDraft(
      { id: "offer-1", propertyId: "property-1", price: 100, message: "Draft", description: "Draft desc" },
      {
        requireBroker: vi.fn(async () => ({
          token: "token",
          context: { userId: "user-1", role: "broker", brokerId: "broker-1", isActive: true },
          profile: null,
        })),
        repository: repository as never,
      },
    );

    expect(repository.updateDraft).toHaveBeenCalledWith(
      { id: "offer-1", propertyId: "property-1", price: 100, message: "Draft", description: "Draft desc" },
      "token",
    );
  });

  it("archives only owner-controlled pending offers", async () => {
    const repository = {
      getOfferLiveState: vi
        .fn()
        .mockResolvedValueOnce({
          id: "offer-1",
          propertyId: "property-1",
          price: 100,
          status: "pending" as const,
          publicationState: "published" as const,
          href: "/ws/offers/offer-1",
          propertyTitle: "Villa",
          propertyAddress: "Riyadh",
          isOwner: true,
          isRecipient: false,
          canEditDraft: false,
          canPublish: false,
          canArchive: true,
          canRespond: false,
        })
        .mockResolvedValueOnce({
          id: "offer-2",
          propertyId: "property-2",
          price: 120,
          status: "accepted" as const,
          publicationState: "published" as const,
          href: "/ws/offers/offer-2",
          propertyTitle: "Tower",
          propertyAddress: "Jeddah",
          isOwner: true,
          isRecipient: false,
          canEditDraft: false,
          canPublish: false,
          canArchive: false,
          canRespond: false,
        }),
      archive: vi.fn(async () => ({ ok: true as const })),
    };
    const requireBroker = vi.fn(async () => ({
      token: "token",
      context: { userId: "user-1", role: "broker", brokerId: "broker-1", isActive: true },
      profile: null,
    }));

    await archiveBrokerOffer({ id: "offer-1" }, { requireBroker, repository: repository as never });
    expect(repository.archive).toHaveBeenCalledWith({ id: "offer-1" }, "token");

    await expect(
      archiveBrokerOffer({ id: "offer-2" }, { requireBroker, repository: repository as never }),
    ).rejects.toBeInstanceOf(DomainError);
  });
});

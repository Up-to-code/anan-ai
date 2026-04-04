import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const {
  getSnapshot,
  getOfferLiveState,
  archiveOffer,
  applyToOffer,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    getSnapshot: vi.fn(async () => ({
      audience: "developer" as const,
      queues: [],
      sent: [],
      received: [],
      marketplace: [],
    })),
    getOfferLiveState: vi.fn(async () => ({
      id: "offer-1",
      packageId: "package-1",
      type: "private_offer" as const,
      stage: "draft" as const,
      propertyId: "property-1",
      price: 2500000,
      status: "pending" as const,
      publicationState: "draft" as const,
      visibility: "private" as const,
      message: "عرض تطويري خاص",
      description: "تفاصيل العرض",
      senderName: "شركة ألف للتطوير",
      recipientAuthUserId: null,
      sourceConversationId: null,
      property: { id: "property-1", title: "مالقا ريزيدنس", address: "الملقا، الرياض", imageUrl: "https://images.unsplash.com/photo-offer" },
      propertyGallery: ["https://images.unsplash.com/photo-offer", "https://images.unsplash.com/photo-offer-2"],
      propertySummary: "واجهة سكنية هادئة",
      commissionText: null,
      permitStatus: null,
      productStatus: null,
      allowedAudience: "both" as const,
      attachments: [],
      clientContext: null,
      primaryOrganization: {
        id: "red-1",
        name: "شركة ألف للتطوير",
        type: "developer" as const,
        logoUrl: null,
        website: "https://example.com",
        contactEmail: "offers@example.com",
      },
      participants: [],
      href: "/ws/offers/offer-1",
      createdAt: 1,
      updatedAt: 1,
      propertyTitle: "مالقا ريزيدنس",
      propertyAddress: "الملقا، الرياض",
      isOwner: true,
      isRecipient: false,
      canEditDraft: true,
      canPublish: true,
      canArchive: true,
      canRespond: false,
      allowedActions: {
        isInventoryOwner: true,
        isClientOwner: false,
        isExecutionPartner: false,
        canEditDraft: true,
        canPublish: true,
        canArchive: true,
        canEngage: false,
        canRespond: false,
        canMarkAgreed: false,
        canCloseWon: false,
        canCloseLost: false,
      },
      activity: [],
    })),
    archiveOffer: vi.fn(async () => ({ ok: true })),
    applyToOffer: vi.fn(async () => ({ offerId: "offer-1", conversationId: null, starterMessageCreated: false, notification: null })),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceOffersZone: vi.fn(() => ({
    getSnapshot,
    getOfferLiveState,
    archiveOffer,
    applyToOffer,
  })),
}));

vi.mock("@/server/domains/workspace/inbox/service", () => ({
  bootstrapInboxOfferConversation: vi.fn(async () => ({ conversationId: "conversation-1" })),
}));

vi.mock("../pages/OfferDetailPage", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>OfferDetailPageMock</div>;
  },
}));

import WorkspaceOfferDetailRoute from "./page";

type CapturedOfferDetailProps = {
  offer: {
    canEditDraft: boolean;
    canArchive: boolean;
  };
  editHref: string | null;
  onArchive: () => Promise<{ redirectTo: string }>;
};

beforeEach(() => {
  getSnapshot.mockClear();
  getOfferLiveState.mockClear();
  archiveOffer.mockClear();
  applyToOffer.mockClear();
  setCapturedProps(null);
});

it("passes owner edit/archive capabilities to the offer detail page", async () => {
  const element = await WorkspaceOfferDetailRoute({
    params: Promise.resolve({ offerId: "offer-1" }),
  });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedOfferDetailProps;

  expect(markup).toContain("OfferDetailPageMock");
  expect(props.offer.canEditDraft).toBe(true);
  expect(props.offer.canArchive).toBe(true);
  expect(props.editHref).toBe("/ws/offers/offer-1/edit");

  await expect(props.onArchive()).resolves.toEqual({ redirectTo: "/ws/offers" });
  expect(archiveOffer).toHaveBeenCalledWith({ id: "offer-1" });
});

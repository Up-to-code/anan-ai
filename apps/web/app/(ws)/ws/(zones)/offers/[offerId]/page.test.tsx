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
      sent: [
        {
          id: "offer-1",
          propertyId: "property-1",
          price: 2500000,
          status: "pending" as const,
          publicationState: "draft" as const,
          visibility: "private" as const,
          message: "عرض تطويري خاص",
          description: "تفاصيل العرض",
          senderName: "شركة ألف للتطوير",
          property: { id: "property-1", title: "مالقا ريزيدنس", address: "الملقا، الرياض", imageUrl: "https://images.unsplash.com/photo-offer" },
        },
      ],
      received: [],
      marketplace: [],
    })),
    getOfferLiveState: vi.fn(async () => ({
      id: "offer-1",
      propertyId: "property-1",
      price: 2500000,
      status: "pending" as const,
      publicationState: "draft" as const,
      href: "/ws/offers/offer-1",
      propertyTitle: "مالقا ريزيدنس",
      propertyAddress: "الملقا، الرياض",
      isOwner: true,
      isRecipient: false,
      canEditDraft: true,
      canPublish: true,
      canArchive: true,
      canRespond: false,
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

vi.mock("../OfferDetailPage", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>OfferDetailPageMock</div>;
  },
}));

import WorkspaceOfferDetailRoute from "./page";

type CapturedOfferDetailProps = {
  canEdit: boolean;
  canArchive: boolean;
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
    searchParams: Promise.resolve({}),
  });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedOfferDetailProps;

  expect(markup).toContain("OfferDetailPageMock");
  expect(props.canEdit).toBe(true);
  expect(props.canArchive).toBe(true);
  expect(props.editHref).toBe("/ws/offers/offer-1/edit");

  await expect(props.onArchive()).resolves.toEqual({ redirectTo: "/ws/offers?tab=sent" });
  expect(archiveOffer).toHaveBeenCalledWith({ id: "offer-1" });
});

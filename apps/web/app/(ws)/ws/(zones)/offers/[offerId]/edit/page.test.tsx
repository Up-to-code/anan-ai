import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { UploadedFileReference } from "@/server/contracts/files";

const {
  getOfferLiveState,
  updateOfferDraft,
  archiveOffer,
  listProperties,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    getOfferLiveState: vi.fn(async () => ({
      id: "offer-1",
      propertyId: "property-1",
      price: 1500000,
      status: "pending" as const,
      publicationState: "draft" as const,
      visibility: "private" as const,
      sourceConversationId: "conversation-1",
      message: "عرض خاص",
      description: "تفاصيل المسودة",
      attachments: [{ key: "file-1", url: "https://files.test/file-1", name: "offer.pdf" }],
      href: "/ws/offers/offer-1",
      propertyTitle: "مالقا ريزيدنس",
      propertyAddress: "الرياض",
      isOwner: true,
      isRecipient: false,
      canEditDraft: true,
      canPublish: true,
      canArchive: true,
      canRespond: false,
      property: { id: "property-1", title: "مالقا ريزيدنس", address: "الرياض" },
    })),
    updateOfferDraft: vi.fn(async () => ({ ok: true })),
    archiveOffer: vi.fn(async () => ({ ok: true })),
    listProperties: vi.fn(async () => ({
      page: [{ _id: "property-1", title: "مالقا ريزيدنس", location: "الرياض", address: "الرياض", price: 1500000 }],
      isDone: true,
      continueCursor: "",
      pageStatus: "Done",
    })),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

vi.mock("../../../../_lib/workspaceData", () => ({
  requireWorkspaceData: vi.fn(async () => ({
    audience: "developer",
    ownerContext: { ownerType: "developer", ownerId: "red-1" },
  })),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NEXT_NOT_FOUND");
  }),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspaceOffersZone: vi.fn(() => ({
    getOfferLiveState,
    updateOfferDraft,
    archiveOffer,
  })),
  getWorkspacePropertyZone: vi.fn(() => ({
    listProperties,
  })),
}));

vi.mock("../../CreateOfferForm", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>CreateOfferFormMock</div>;
  },
}));

import WorkspaceOfferEditRoute from "./page";

type CapturedOfferFormProps = {
  initialData: {
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
    attachments: UploadedFileReference[];
  };
  onSubmit: (data: {
    propertyId: string;
    title: string;
    description: string;
    price: string;
    visibility: "public" | "private";
    attachments: UploadedFileReference[];
  }) => Promise<{ redirectTo: string }>;
  onArchive: () => Promise<{ redirectTo: string }>;
};

beforeEach(() => {
  getOfferLiveState.mockClear();
  updateOfferDraft.mockClear();
  archiveOffer.mockClear();
  listProperties.mockClear();
  setCapturedProps(null);
});

it("loads the editable offer draft form and wires save + archive actions", async () => {
  const element = await WorkspaceOfferEditRoute({ params: Promise.resolve({ offerId: "offer-1" }) });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedOfferFormProps;

  expect(markup).toContain("CreateOfferFormMock");
  expect(props.initialData.title).toBe("عرض خاص");
  expect(props.initialData.visibility).toBe("private");

  await expect(props.onSubmit({
    propertyId: "property-1",
    title: "مسودة محدثة",
    description: "تفاصيل محدثة",
    price: "1750000",
    visibility: "private",
    attachments: [{ key: "file-2", url: "https://files.test/file-2", name: "updated.pdf" }],
  })).resolves.toEqual({ redirectTo: "/ws/offers/offer-1" });

  expect(updateOfferDraft).toHaveBeenCalledWith(expect.objectContaining({
    id: "offer-1",
    conversationId: "conversation-1",
    message: "مسودة محدثة",
    description: "تفاصيل محدثة",
  }));

  await expect(props.onArchive()).resolves.toEqual({ redirectTo: "/ws/offers?tab=sent" });
  expect(archiveOffer).toHaveBeenCalledWith({ id: "offer-1" });
});

it("returns 404 when the offer draft is not editable", async () => {
  getOfferLiveState.mockResolvedValueOnce({
    id: "offer-1",
    propertyId: "property-1",
    price: 1500000,
    status: "pending" as const,
    publicationState: "published" as const,
    href: "/ws/offers/offer-1",
    propertyTitle: "مالقا ريزيدنس",
    propertyAddress: "الرياض",
    isOwner: true,
    isRecipient: false,
    canEditDraft: false,
    canPublish: false,
    canArchive: true,
    canRespond: false,
    property: { id: "property-1", title: "مالقا ريزيدنس", address: "الرياض" },
  });

  await expect(
    WorkspaceOfferEditRoute({ params: Promise.resolve({ offerId: "offer-1" }) }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
});

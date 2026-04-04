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
      packageId: "package-1",
      type: "private_offer" as const,
      stage: "draft" as const,
      propertyId: "property-1",
      price: 1500000,
      status: "pending" as const,
      publicationState: "draft" as const,
      visibility: "private" as const,
      sourceConversationId: "conversation-1",
      message: "عرض خاص",
      description: "تفاصيل المسودة",
      senderName: "شركة ألف للتطوير",
      attachments: [{ key: "file-1", url: "https://files.test/file-1", name: "offer.pdf" }],
      recipientAuthUserId: null,
      propertyGallery: [],
      propertySummary: null,
      commissionText: "2%",
      permitStatus: "جاهز",
      productStatus: "متاح",
      allowedAudience: "both" as const,
      clientContext: null,
      primaryOrganization: null,
      participants: [],
      href: "/ws/offers/offer-1",
      createdAt: 1,
      updatedAt: 1,
      propertyTitle: "مالقا ريزيدنس",
      propertyAddress: "الرياض",
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

vi.mock("../../../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam: vi.fn(async () => ({
    organization: { id: "red-1", type: "red", name: "شركة ألف للتطوير", slug: "alpha-dev", status: "active", isVerified: true },
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

vi.mock("../../shared/forms/CreateOfferForm", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>CreateOfferFormMock</div>;
  },
}));

import WorkspaceOfferEditRoute from "./page";

type CapturedOfferFormProps = {
  initialData: {
    propertyId: string;
    mode: "open_offer" | "private_offer" | "collaboration_case";
    title: string;
    description: string;
    price: string;
    allowedAudience: "brokers" | "developers" | "both";
    attachments: UploadedFileReference[];
  };
  onSubmit: (data: {
    propertyId: string;
    mode: "open_offer" | "private_offer" | "collaboration_case";
    title: string;
    description: string;
    price: string;
    allowedAudience: "brokers" | "developers" | "both";
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
  expect(props.initialData.mode).toBe("private_offer");
  expect(props.initialData.allowedAudience).toBe("both");

  await expect(props.onSubmit({
    propertyId: "property-1",
    mode: "private_offer",
    title: "مسودة محدثة",
    description: "تفاصيل محدثة",
    price: "1750000",
    allowedAudience: "brokers",
    attachments: [{ key: "file-2", url: "https://files.test/file-2", name: "updated.pdf" }],
  })).resolves.toEqual({ redirectTo: "/ws/offers/offer-1" });

  expect(updateOfferDraft).toHaveBeenCalledWith(expect.objectContaining({
    id: "offer-1",
    conversationId: "conversation-1",
    message: "مسودة محدثة",
    description: "تفاصيل محدثة",
  }));

  await expect(props.onArchive()).resolves.toEqual({ redirectTo: "/ws/offers" });
  expect(archiveOffer).toHaveBeenCalledWith({ id: "offer-1" });
});

it("returns 404 when the offer draft is not editable", async () => {
  getOfferLiveState.mockResolvedValueOnce({
    id: "offer-1",
    packageId: "package-1",
    type: "private_offer" as const,
    stage: "targeted" as const,
    propertyId: "property-1",
    price: 1500000,
    status: "pending" as const,
    publicationState: "published" as const,
    visibility: "private" as const,
    message: "عرض خاص",
    description: null,
    senderName: "شركة ألف للتطوير",
    recipientAuthUserId: null,
    sourceConversationId: null,
    propertyGallery: [],
    propertySummary: null,
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "both" as const,
    attachments: [],
    clientContext: null,
    primaryOrganization: null,
    participants: [],
    href: "/ws/offers/offer-1",
    createdAt: 1,
    updatedAt: 1,
    propertyTitle: "مالقا ريزيدنس",
    propertyAddress: "الرياض",
    isOwner: true,
    isRecipient: false,
    canEditDraft: false,
    canPublish: false,
    canArchive: true,
    canRespond: false,
    allowedActions: {
      isInventoryOwner: true,
      isClientOwner: false,
      isExecutionPartner: false,
      canEditDraft: false,
      canPublish: false,
      canArchive: true,
      canEngage: false,
      canRespond: false,
      canMarkAgreed: false,
      canCloseWon: false,
      canCloseLost: false,
    },
    activity: [],
    property: { id: "property-1", title: "مالقا ريزيدنس", address: "الرياض" },
  });

  await expect(
    WorkspaceOfferEditRoute({ params: Promise.resolve({ offerId: "offer-1" }) }),
  ).rejects.toThrow("NEXT_NOT_FOUND");
});

import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";
import type { UploadedFileReference } from "@/server/contracts/files";

const {
  listProperties,
  createOffer,
  publishOffer,
  getCapturedProps,
  setCapturedProps,
} = vi.hoisted(() => {
  let capturedProps: unknown = null;

  return {
    listProperties: vi.fn(async () => ({
      page: [{ _id: "property-1", title: "مالقا ريزيدنس", location: "الرياض", address: "الرياض", price: 1500000 }],
      isDone: true,
      continueCursor: "",
    })),
    createOffer: vi.fn(async () => ({
      offerId: "offer-1",
      conversationId: null,
      starterMessageCreated: false,
      notification: null,
    })),
    publishOffer: vi.fn(async () => ({ ok: true as const })),
    getCapturedProps: () => capturedProps,
    setCapturedProps: (props: unknown) => {
      capturedProps = props;
    },
  };
});

const { requireWorkspaceData } = vi.hoisted(() => ({
  requireWorkspaceData: vi.fn(),
}));

vi.mock("../../../_lib/workspaceData", () => ({
  requireWorkspaceData,
}));

vi.mock("../../../_lib/organizationTeam", () => ({
  getWorkspaceOrganizationTeam: vi.fn(async () => ({
    organization: { id: "broker-org-1", type: "broker", name: "وسيط الاختبار", slug: "broker-test", status: "active", isVerified: true },
  })),
}));

const { getWorkspacePropertyZone, getWorkspaceOffersZone } = vi.hoisted(() => ({
  getWorkspacePropertyZone: vi.fn(() => ({
    listProperties,
  })),
  getWorkspaceOffersZone: vi.fn(() => ({
    createOffer,
    publishOffer,
  })),
}));

vi.mock("@/server/ws/zones", () => ({
  getWorkspacePropertyZone,
  getWorkspaceOffersZone,
}));

vi.mock("../shared/forms/CreateOfferForm", () => ({
  default: (props: unknown) => {
    setCapturedProps(props);
    return <div>CreateOfferFormMock</div>;
  },
}));

import CreateOfferPage from "./page";

type CapturedOfferFormProps = {
  properties: Array<{ id: string; title: string }>;
  onSubmit: (data: {
    propertyId?: string;
    mode: "open_offer" | "private_offer" | "collaboration_case";
    title: string;
    description: string;
    price: string;
    allowedAudience: "brokers" | "developers" | "both";
    attachments: UploadedFileReference[];
  }) => Promise<{ redirectTo: string }>;
};

beforeEach(() => {
  requireWorkspaceData.mockReset();
  listProperties.mockClear();
  createOffer.mockClear();
  publishOffer.mockClear();
  setCapturedProps(null);
});

it("renders the broker offer form even when ownerContext is missing", async () => {
  requireWorkspaceData.mockResolvedValue({
    audience: "broker",
    ownerContext: null,
  });

  const element = await CreateOfferPage({ searchParams: Promise.resolve({}) });
  const markup = renderToStaticMarkup(element);
  const props = getCapturedProps() as CapturedOfferFormProps;

  expect(markup).toContain("CreateOfferFormMock");
  expect(getWorkspacePropertyZone).toHaveBeenCalledWith("broker", null);
  expect(props.properties[0]?.title).toBe("مالقا ريزيدنس");

  await expect(props.onSubmit({
    propertyId: "property-1",
    mode: "open_offer",
    title: "عرض جديد",
    description: "تفاصيل العرض",
    price: "1750000",
    allowedAudience: "both",
    attachments: [],
  })).resolves.toEqual({ redirectTo: "/ws/offers/offer-1" });

  expect(createOffer).toHaveBeenCalledWith(expect.objectContaining({
    propertyId: "property-1",
    message: "عرض جديد",
    description: "تفاصيل العرض",
    price: 1750000,
  }));
  expect(getWorkspaceOffersZone).toHaveBeenCalledWith("broker", null);
  expect(publishOffer).toHaveBeenCalledWith({ id: "offer-1" });
});

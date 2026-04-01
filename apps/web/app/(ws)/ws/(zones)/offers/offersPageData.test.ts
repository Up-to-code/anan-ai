import { describe, expect, it } from "vitest";
import {
  buildOffersRouteBase,
  filterOffersByQuery,
  flattenOffers,
  sortOffers,
} from "./offersPageData";
import type { WorkspaceOfferQueue, WorkspaceOfferSummary } from "./offerTypes";

function buildOffer(args: {
  id: string;
  message: string;
  updatedAt: number;
  createdAt?: number;
  propertyTitle?: string;
  senderName?: string;
  organizationName?: string;
}) {
  const offer: WorkspaceOfferSummary = {
    id: args.id,
    packageId: `package-${args.id}`,
    type: "open_offer",
    stage: "open",
    status: "pending",
    publicationState: "published",
    visibility: "public",
    propertyId: `property-${args.id}`,
    price: 1000000,
    message: args.message,
    description: `${args.message} description`,
    senderName: args.senderName ?? "شركة افتراضية",
    recipientAuthUserId: null,
    sourceConversationId: null,
    property: {
      id: `property-${args.id}`,
      title: args.propertyTitle ?? args.message,
      address: "الرياض",
      imageUrl: null,
    },
    propertyGallery: [],
    propertySummary: "نبذة سريعة",
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "both",
    attachments: [],
    clientContext: null,
    primaryOrganization: {
      id: "org-1",
      name: args.organizationName ?? "شركة افتراضية",
      type: "developer",
      logoUrl: null,
      website: null,
      contactEmail: null,
    },
    participants: [],
    href: `/ws/offers/${args.id}`,
    createdAt: args.createdAt ?? args.updatedAt,
    updatedAt: args.updatedAt,
  };

  return offer;
}

describe("offersPageData", () => {
  it("flattens queue items and deduplicates by latest updatedAt", () => {
    const duplicatedOlder = buildOffer({
      id: "offer-1",
      message: "عرض أقدم",
      updatedAt: 10,
      organizationName: "شركة أولى",
    });
    const duplicatedNewer = buildOffer({
      id: "offer-1",
      message: "عرض أحدث",
      updatedAt: 20,
      organizationName: "شركة أحدث",
    });
    const second = buildOffer({
      id: "offer-2",
      message: "عرض مستقل",
      updatedAt: 15,
    });

    const queues: WorkspaceOfferQueue[] = [
      {
        key: "open_inventory",
        label: "Open Inventory Offers",
        description: "",
        items: [duplicatedOlder, second],
      },
      {
        key: "targeted_shares",
        label: "Targeted Shares",
        description: "",
        items: [duplicatedNewer],
      },
    ];

    const flattened = flattenOffers(queues);

    expect(flattened).toHaveLength(2);
    expect(flattened.find((item) => item.id === "offer-1")?.message).toBe("عرض أحدث");
    expect(flattened.find((item) => item.id === "offer-1")?.primaryOrganization?.name).toBe("شركة أحدث");
  });

  it("sorts offers by updatedAt in both directions", () => {
    const first = buildOffer({ id: "offer-1", message: "الأول", updatedAt: 10 });
    const second = buildOffer({ id: "offer-2", message: "الثاني", updatedAt: 20 });
    const third = buildOffer({ id: "offer-3", message: "الثالث", updatedAt: 5 });

    expect(sortOffers([first, second, third], "updated_desc").map((item) => item.id)).toEqual([
      "offer-2",
      "offer-1",
      "offer-3",
    ]);
    expect(sortOffers([first, second, third], "updated_asc").map((item) => item.id)).toEqual([
      "offer-3",
      "offer-1",
      "offer-2",
    ]);
  });

  it("filters by search query and preserves clean route params", () => {
    const propertyOffer = buildOffer({
      id: "offer-1",
      message: "عرض شمال الرياض",
      updatedAt: 1,
      propertyTitle: "شقة فاخرة",
      organizationName: "شركة الرياض",
    });
    const otherOffer = buildOffer({
      id: "offer-2",
      message: "عرض جدة",
      updatedAt: 2,
      propertyTitle: "شقة بحرية",
      organizationName: "شركة جدة",
    });

    const filtered = filterOffersByQuery([propertyOffer, otherOffer], "شركة الرياض");

    expect(filtered.map((item) => item.id)).toEqual(["offer-1"]);
    expect(buildOffersRouteBase({ searchQuery: "الرياض", sort: "updated_desc" })).toBe("/ws/offers?q=%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6");
    expect(buildOffersRouteBase({ searchQuery: "جدة", sort: "updated_asc" })).toBe(
      "/ws/offers?q=%D8%AC%D8%AF%D8%A9&sort=updated_asc",
    );
  });
});

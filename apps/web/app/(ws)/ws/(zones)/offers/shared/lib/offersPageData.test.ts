import { describe, expect, it } from "vitest";
import {
  buildOfferFilterOptions,
  buildOffersRouteBase,
  filterOffers,
  filterOffersByQuery,
  flattenOffers,
  resolveFilters,
  sortOffers,
} from "./offersPageData";
import type { WorkspaceOfferQueue, WorkspaceOfferSummary } from "../../types/offerTypes";

function buildOffer(args: {
  id: string;
  message: string;
  updatedAt: number;
  createdAt?: number;
  propertyTitle?: string;
  senderName?: string;
  organizationName?: string;
  propertyPrice?: number;
  propertyBeds?: number;
  propertyBaths?: number;
  propertySqft?: number;
  propertyLocation?: string;
  propertyArea?: string;
  clientContext?: WorkspaceOfferSummary["clientContext"];
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
      address: args.propertyLocation ?? "الرياض",
      price: args.propertyPrice ?? 1000000,
      beds: args.propertyBeds,
      baths: args.propertyBaths,
      sqft: args.propertySqft,
      location: args.propertyLocation,
      area: args.propertyArea,
      imageUrl: null,
    },
    propertyGallery: [],
    propertySummary: "نبذة سريعة",
    commissionText: null,
    permitStatus: null,
    productStatus: null,
    allowedAudience: "both",
    attachments: [],
    clientContext: args.clientContext ?? null,
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
    expect(
      buildOffersRouteBase({
        searchQuery: "الرياض",
        sort: "updated_desc",
        filters: { area: "", location: "" },
      }),
    ).toBe("/ws/offers?q=%D8%A7%D9%84%D8%B1%D9%8A%D8%A7%D8%B6");
    expect(
      buildOffersRouteBase({
        searchQuery: "جدة",
        sort: "updated_asc",
        filters: { area: "", location: "" },
      }),
    ).toBe(
      "/ws/offers?q=%D8%AC%D8%AF%D8%A9&sort=updated_asc",
    );
  });

  it("resolves and applies structured filters to property and client requirement offers", () => {
    const propertyOffer = buildOffer({
      id: "offer-1",
      message: "فيلا جاهزة",
      updatedAt: 1,
      propertyTitle: "فيلا جاهزة",
      propertyPrice: 4200000,
      propertyBeds: 4,
      propertyBaths: 4,
      propertySqft: 320,
      propertyLocation: "الرياض",
      propertyArea: "الياسمين",
    });
    const clientRequirementOffer = buildOffer({
      id: "offer-2",
      message: "عميل يبحث عن شقة",
      updatedAt: 2,
      propertyTitle: "بدون عقار",
      clientContext: {
        clientName: "عميل يبحث عن شقة",
        clientNeed: "شقة واسعة وجاهزة",
        clientBudget: "2,900,000 ر.س",
        budgetMin: 2400000,
        budgetMax: 2900000,
        location: "الرياض",
        area: "الملقا",
        bedsMin: 3,
        bathsMin: 3,
        sqftMin: 180,
        sqftMax: 240,
      },
    });

    const filters = resolveFilters({
      budgetMin: "2300000",
      budgetMax: "3000000",
      bedsMin: "3",
      bathsMin: "3",
      sqftMin: "170",
      sqftMax: "250",
      location: "الرياض",
      area: "الملقا",
    });

    expect(
      filterOffers([propertyOffer, clientRequirementOffer], {
        searchQuery: "",
        filters,
      }).map((item) => item.id),
    ).toEqual(["offer-2"]);

    expect(
      filterOffers([propertyOffer, clientRequirementOffer], {
        searchQuery: "",
        filters: {
          budgetMin: 4000000,
          bedsMin: 4,
          bathsMin: 4,
          sqftMin: 300,
          area: "الياسمين",
          location: "الرياض",
        },
      }).map((item) => item.id),
    ).toEqual(["offer-1"]);
  });

  it("builds searchable Saudi-first options from the current offers", () => {
    const filters = resolveFilters({});
    const options = buildOfferFilterOptions([
      buildOffer({ id: "offer-sa", message: "عرض الرياض", updatedAt: 1, propertyLocation: "الرياض", propertyArea: "الملقا" }),
      buildOffer({ id: "offer-jeddah", message: "عرض جدة", updatedAt: 3, propertyLocation: "جدة", propertyArea: "الشاطئ" }),
    ]);

    expect(options.locations).toContain("الرياض");
    expect(options.locations).toContain("جدة");
    expect(options.areas).toContain("الملقا");
    expect(filters).toEqual({ area: "", location: "" });
  });
});

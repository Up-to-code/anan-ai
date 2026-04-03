import { describe, expect, it } from "vitest";
import {
  buildAssistantSearchContext,
  buildSearchRouteParams,
  filterPropertiesForSearch,
  parseSearchRouteParams,
} from "@/lib/mobileSearch";
import type { MobileProperty } from "@/types/mobile";

const sampleProperties: MobileProperty[] = [
  {
    id: "property-1",
    title: "Olive Residence",
    address: "Riyadh Front",
    location: "الرياض",
    area: "الصحافة",
    price: 1200000,
    beds: 3,
    baths: 3,
    media: ["https://example.com/1.jpg"],
    owner: {
      id: "broker-1",
      type: "broker",
      name: "Broker One",
      slug: "broker-one",
      isVerified: true,
    },
  },
  {
    id: "property-2",
    title: "Palm Residence",
    address: "Jeddah Corniche",
    location: "جدة",
    area: "الشاطئ",
    price: 1800000,
    beds: 4,
    baths: 4,
    media: ["https://example.com/2.jpg"],
    owner: {
      id: "developer-1",
      type: "RED",
      name: "Developer One",
      slug: "developer-one",
      isVerified: true,
    },
  },
];

describe("mobileSearch", () => {
  it("builds an assistant search context from the active property", () => {
    const context = buildAssistantSearchContext({
      activeProperty: sampleProperties[0],
      threadId: "thread-1",
    });

    expect(context?.threadId).toBe("thread-1");
    expect(context?.sourcePropertyId).toBe("property-1");
    expect(context?.searchSummary).toContain("Olive Residence");
    expect(context?.area).toBe("الصحافة");
  });

  it("round-trips assistant search params through the route helpers", () => {
    const context = buildAssistantSearchContext({
      activeProperty: sampleProperties[0],
      threadId: "thread-1",
    });
    const parsed = parseSearchRouteParams(buildSearchRouteParams(context));

    expect(parsed).toEqual(context);
  });

  it("filters results with assistant-provided criteria and manual refinements together", () => {
    const results = filterPropertiesForSearch(sampleProperties, {
      query: "",
      selectedArea: "الصحافة",
      selectedOwnerType: "وسيط",
      allFilterLabel: "الكل",
    });

    expect(results.map((property) => property.id)).toEqual(["property-1"]);
  });
});

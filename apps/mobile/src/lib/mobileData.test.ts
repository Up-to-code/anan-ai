import { describe, expect, it } from "vitest";
import {
  buildPropertyFocusMessage,
  mapMvpPropertyToMobileProperty,
  toMobileProperty,
} from "@/lib/mobileData";
import type { MobileProperty } from "@/types/mobile";

const sampleProperty: MobileProperty = {
  id: "property-1",
  title: "Olive Residence",
  address: "Riyadh Front",
  location: "الرياض",
  area: "الصحافة",
  price: 1200000,
  beds: 3,
  baths: 3,
  media: ["https://example.com/1.jpg", "https://example.com/2.jpg"],
  owner: {
    id: "broker-1",
    type: "broker",
    name: "Broker One",
    slug: "broker-one",
    isVerified: true,
  },
  aiSummary: "وحدة جاهزة في موقع حيوي.",
};

describe("mobileData", () => {
  it("builds the property focus assistant message with prompts", () => {
    const message = buildPropertyFocusMessage(sampleProperty);

    expect(message.role).toBe("assistant");
    expect(message.properties?.[0]?.title).toBe("Olive Residence");
    expect(message.suggestedPrompts?.length).toBeGreaterThan(0);
  });

  it("normalizes live mobile properties without mutating the owner shape", () => {
    const normalized = toMobileProperty(sampleProperty);

    expect(normalized.owner.name).toBe(sampleProperty.owner.name);
    expect(normalized.media).toEqual(sampleProperty.media);
  });

  it("maps MVP properties into the mobile property contract", () => {
    const mapped = mapMvpPropertyToMobileProperty({
      id: "legacy-1",
      title: "Legacy Tower",
      propertyType: "apartment",
      city: "الرياض",
      area: "النرجس",
      address: "Riyadh",
      price: 950000,
      beds: 2,
      baths: 2,
      sqft: 1200,
      heroImage: "https://example.com/hero.jpg",
      gallery: [],
      ownerName: "Legacy Broker",
      ownerType: "broker",
      isVerified: true,
      summary: "ملخص",
      annualRentEstimate: 70000,
      permitStatus: "verified",
      paymentMonths: 60,
      downPaymentRate: 0.1,
    });

    expect(mapped.owner.slug).toBe("legacy-broker");
    expect(mapped.media).toEqual(["https://example.com/hero.jpg"]);
  });
});

import { describe, expect, it } from "vitest";
import { applyActivePropertyPromptToDraft, buildActivePropertyPrompt } from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import type { MobileProperty } from "@/types/mobile";

function createProperty(): MobileProperty {
  return {
    id: "property-1",
    title: "Palm Residence",
    address: "Riyadh Front",
    location: "الرياض",
    area: "الياسمين",
    price: 1400000,
    beds: 3,
    baths: 3,
    sqft: 185,
    media: ["https://example.com/cover.jpg"],
    owner: {
      id: "broker-1",
      type: "broker",
      name: "Broker One",
      slug: "broker-one",
      isVerified: true,
    },
  };
}

describe("propertyPrompt", () => {
  it("builds the default active-property prompt", () => {
    expect(buildActivePropertyPrompt(createProperty())).toBe("أريد تفاصيل أكثر عن Palm Residence");
  });

  it("uses the full property prompt when the draft is empty", () => {
    expect(applyActivePropertyPromptToDraft("", createProperty())).toBe("أريد تفاصيل أكثر عن Palm Residence");
  });

  it("prefixes an existing draft once with the active property context", () => {
    expect(applyActivePropertyPromptToDraft("احسب التمويل", createProperty())).toBe("عن Palm Residence: احسب التمويل");
  });

  it("does not duplicate the same property context on repeated taps", () => {
    expect(applyActivePropertyPromptToDraft("عن Palm Residence: احسب التمويل", createProperty())).toBe(
      "عن Palm Residence: احسب التمويل",
    );
    expect(applyActivePropertyPromptToDraft("أريد تفاصيل أكثر عن Palm Residence", createProperty())).toBe(
      "أريد تفاصيل أكثر عن Palm Residence",
    );
  });
});

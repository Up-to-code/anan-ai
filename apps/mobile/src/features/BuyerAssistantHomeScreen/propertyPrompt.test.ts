import { describe, expect, it } from "vitest";
import {
  applyPropertySelectionPromptToDraft,
  buildPropertySelectionTopicPrompt,
  buildPropertySelectionPrompt,
} from "@/features/BuyerAssistantHomeScreen/propertyPrompt";
import type { MobileProperty } from "@/types/mobile";

function createProperty(id = "property-1", title = "Palm Residence"): MobileProperty {
  return {
    id,
    title,
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
  it("builds the default comparison prompt for multiple selected properties", () => {
    expect(buildPropertySelectionPrompt([createProperty("property-1", "Palm Residence"), createProperty("property-2", "Garden Villa")])).toBe(
      "أريد مقارنة بين Palm Residence وGarden Villa من حيث السعر والمساحة والموقع وخيارات التمويل",
    );
  });

  it("applies single-property context onto the draft once", () => {
    expect(applyPropertySelectionPromptToDraft("", [createProperty()])).toBe("أريد تفاصيل أكثر عن Palm Residence");
    expect(applyPropertySelectionPromptToDraft("احسب التمويل", [createProperty()])).toBe("عن Palm Residence: احسب التمويل");
    expect(applyPropertySelectionPromptToDraft("عن Palm Residence: احسب التمويل", [createProperty()])).toBe(
      "عن Palm Residence: احسب التمويل",
    );
    expect(applyPropertySelectionPromptToDraft("أريد تفاصيل أكثر عن Palm Residence", [createProperty()])).toBe(
      "أريد تفاصيل أكثر عن Palm Residence",
    );
  });

  it("prefixes comparison context once when several properties are selected", () => {
    expect(
      applyPropertySelectionPromptToDraft(
        "ما الأفضل للاستثمار؟",
        [createProperty("property-1", "Palm Residence"), createProperty("property-2", "Garden Villa")],
      ),
    ).toBe("بالنسبة إلى مقارنة بين Palm Residence وGarden Villa: ما الأفضل للاستثمار؟");
  });

  it("builds topic prompts for fixed-card content shortcuts", () => {
    expect(buildPropertySelectionTopicPrompt([createProperty()], "finance")).toBe("احسب تمويل Palm Residence");
    expect(
      buildPropertySelectionTopicPrompt(
        [createProperty("property-1", "Palm Residence"), createProperty("property-2", "Garden Villa")],
        "comparison",
      ),
    ).toBe("أريد مقارنة بين Palm Residence وGarden Villa من حيث السعر والمساحة والموقع وخيارات التمويل");
  });
});

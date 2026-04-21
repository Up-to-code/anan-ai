import { describe, expect, it } from "vitest";
import {
  applyPropertySelectionPromptToDraft,
  buildPropertySelectionTopicPrompt,
  buildPropertySelectionTopicPromptForLocale,
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

  it("keeps multi-property drafts unchanged until the user explicitly chooses compare", () => {
    expect(
      applyPropertySelectionPromptToDraft(
        "ما الأفضل للاستثمار؟",
        [createProperty("property-1", "Palm Residence"), createProperty("property-2", "Garden Villa")],
      ),
    ).toBe("ما الأفضل للاستثمار؟");
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

  it("builds English prompts when the mobile locale is en", () => {
    expect(buildPropertySelectionPrompt([createProperty()], "en")).toBe("I want more details about Palm Residence");
    expect(applyPropertySelectionPromptToDraft("Calculate the monthly installment", [createProperty()], "en")).toBe(
      "About Palm Residence: Calculate the monthly installment",
    );
    expect(buildPropertySelectionTopicPromptForLocale([createProperty()], "finance", "en")).toBe(
      "Calculate financing for Palm Residence",
    );
  });
});

import { describe, expect, it } from "vitest";
import { buildMobileAgUiTurn } from "@/lib/mobileAgUi";
import type { MobileAssistantCard, MobileProperty } from "@/types/mobile";

const sampleProperty: MobileProperty = {
  id: "property-voice-1",
  title: "Palm Residence",
  address: "Riyadh Front",
  location: "الرياض",
  area: "الياسمين",
  price: 1400000,
  beds: 3,
  baths: 3,
  media: ["https://example.com/cover.jpg"],
  owner: {
    id: "broker-1",
    type: "broker",
    name: "Broker One",
    slug: "broker-one",
    isVerified: true,
  },
};

describe("buildMobileAgUiTurn", () => {
  it("keeps buyer bank offers and follow-up prompts in the mobile AG UI contract", () => {
    const cards: MobileAssistantCard[] = [
      {
        type: "bank_offer",
        title: "عرض بنكي",
        bankName: "بنك الرياض",
        rateLabel: "4.5%",
        downPaymentPercent: 15,
        monthlyEstimate: 7400,
        summary: "عرض مبدئي لمشتري جاهز.",
      },
      {
        type: "broker_handoff",
        title: "الخطوة التالية",
        handoffStatus: "qualified",
        summary: "يمكننا تحويلك الآن إلى مستشار.",
      },
    ];

    const turn = buildMobileAgUiTurn({
      assistantText: "وجدت لك تمويلاً مناسباً.",
      properties: [sampleProperty],
      cards,
    });

    expect(turn?.cards.map((card) => card.componentId)).toEqual([
      "property_shortlist",
      "bank_offer",
      "followup_prompt",
    ]);
  });
});

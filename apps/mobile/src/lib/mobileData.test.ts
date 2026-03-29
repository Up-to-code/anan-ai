import { describe, expect, it } from "vitest";
import {
  buildMobileAuthBridgePayload,
  buildPropertyFocusMessage,
  compactMobileProperty,
} from "@/lib/mobileData";
import type { MobileConversationMessage, MobileProperty } from "@/types/mobile";

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
  it("builds a compact auth bridge payload for transcript sync", () => {
    const transcript: MobileConversationMessage[] = Array.from({ length: 14 }, (_, index) => ({
      id: `message-${index}`,
      role: index % 2 === 0 ? "user" : "assistant",
      text: `turn-${index}`,
      properties: [sampleProperty],
      activePropertyId: sampleProperty.id,
    }));

    const payload = buildMobileAuthBridgePayload({
      messages: transcript,
      activeProperty: sampleProperty,
      includeHandoff: true,
    });

    expect(payload.messages).toHaveLength(12);
    expect(payload.messages[0]?.text).toBe("turn-2");
    expect(payload.activeProperty?.media).toEqual(["https://example.com/1.jpg"]);
    expect(payload.handoff?.propertyId).toBe(sampleProperty.id);
  });

  it("builds the property focus assistant message with prompts", () => {
    const message = buildPropertyFocusMessage(sampleProperty);

    expect(message.role).toBe("assistant");
    expect(message.properties?.[0]?.title).toBe("Olive Residence");
    expect(message.suggestedPrompts?.length).toBeGreaterThan(0);
  });

  it("keeps compact properties limited to one media asset", () => {
    expect(compactMobileProperty(sampleProperty).media).toEqual(["https://example.com/1.jpg"]);
  });
});

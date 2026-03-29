import { describe, expect, it } from "vitest";
import { getLatestThreadProperty, toAssistantMessage, toTranscriptSeedMessages } from "./threadPersistence";
import type { AssistantMessage, PersistedThreadMessage } from "./types";

const sampleProperty = {
  id: "property-1",
  title: "Olive Residence",
  address: "Riyadh",
  price: 1200000,
  beds: 3,
  baths: 3,
  media: [],
  owner: {
    id: "broker-1",
    type: "broker" as const,
    name: "Broker One",
    slug: "broker-one",
    isVerified: true,
  },
};

describe("threadPersistence", () => {
  it("rehydrates assistant messages into AG UI turns", () => {
    const storedMessage: PersistedThreadMessage = {
      id: "assistant-1",
      role: "assistant",
      text: "I reviewed this property for you.",
      createdAt: 1,
      properties: [sampleProperty],
      activePropertyId: "property-1",
      suggestedPrompts: ["Show me more options"],
      requiresAuthForHandoff: true,
      cards: [
        {
          type: "broker_handoff",
          title: "Advisor handoff",
          handoffStatus: "qualified",
          summary: "Ready for an advisor handoff.",
        },
      ],
    };

    const message = toAssistantMessage(storedMessage);

    expect(message.uiTurn?.cards.length).toBeGreaterThan(0);
    expect(message.properties?.[0]?.title).toBe("Olive Residence");
    expect(message.activePropertyId).toBe("property-1");
    expect(message.suggestedPrompts).toEqual(["Show me more options"]);
    expect(message.requiresAuthForHandoff).toBe(true);
  });

  it("preserves transcript order and handoff metadata when seeding a saved thread", () => {
    const transcript: AssistantMessage[] = [
      { id: "user-1", role: "user", text: "Find me an apartment in Riyadh" },
      {
        id: "assistant-1",
        role: "assistant",
        text: "Here is a verified option.",
        properties: [sampleProperty],
        cards: [
          {
            type: "broker_handoff",
            title: "Advisor handoff",
            handoffStatus: "qualified",
            summary: "Ready for an advisor handoff.",
          },
        ],
      },
    ];

    const seeded = toTranscriptSeedMessages(transcript);

    expect(seeded.map((item) => item.role)).toEqual(["user", "assistant"]);
    expect(seeded[1]?.activePropertyId).toBe("property-1");
    expect(seeded[1]?.requiresAuthForHandoff).toBe(true);
    expect(getLatestThreadProperty(transcript)?.title).toBe("Olive Residence");
  });
});

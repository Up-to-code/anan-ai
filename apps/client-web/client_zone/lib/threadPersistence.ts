import { buildClientUiTurn } from "./clientAgUi";
import type {
  AssistantMessage,
  ClientProperty,
  PersistedThreadMessage,
  TranscriptSeedMessage,
} from "./types";

/**
 * WHY:   Persisted Convex messages need one mapping layer before the client UI renders them as assistant turns.
 * WHAT:  Converts one stored thread message DTO into the UI-facing assistant message shape.
 * HOW:   Rehydrates the AG UI turn for assistant messages while leaving user messages compact.
 */
export function toAssistantMessage(message: PersistedThreadMessage): AssistantMessage {
  return {
    id: message.id,
    role: message.role,
    text: message.text,
    properties: message.properties,
    cards: message.cards,
    uiTurn:
      message.role === "assistant"
        ? buildClientUiTurn({
            assistantText: message.text,
            properties: message.properties,
            cards: message.cards,
          })
        : undefined,
  };
}

/**
 * WHY:   The chat shell needs one stable way to infer the currently highlighted property from an existing transcript.
 * WHAT:  Returns the latest property surfaced in the provided assistant messages.
 * HOW:   Walks the thread from newest to oldest and picks the first property-bearing turn.
 */
export function getLatestThreadProperty(messages: AssistantMessage[]): ClientProperty | null {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const property = messages[index]?.properties?.[0];
    if (property) return property;
  }
  return null;
}

/**
 * WHY:   Guest conversations need a lossless bridge when they become authenticated saved threads.
 * WHAT:  Projects the active UI transcript into the mutation input used to seed a Convex thread.
 * HOW:   Copies only the durable fields required to reconstruct assistant turns after sign-in.
 */
export function toTranscriptSeedMessages(messages: AssistantMessage[]): TranscriptSeedMessage[] {
  return messages.map((message) => ({
    role: message.role,
    text: message.text,
    properties: message.properties,
    cards: message.cards,
    activePropertyId: message.properties?.[0]?.id,
    requiresAuthForHandoff: message.cards?.some((card) => card.type === "broker_handoff"),
  }));
}

import type { MobileConversationMessage, MobileProperty } from "@/types/mobile";

type AssistantSelectionSource = "ui_selected" | "history_resolved" | "text_resolved";

type AssistantSelectionPayload = {
  selectedPropertyId?: string;
  selectedPropertyIds?: string[];
};

type AssistantResponseLike = {
  properties: MobileProperty[];
  activePropertyId?: string;
  comparisonPropertyIds?: string[];
};

function uniquePropertyIds(propertyIds: string[]) {
  const seen = new Set<string>();
  return propertyIds.filter((propertyId) => {
    const normalizedPropertyId = propertyId.trim();
    if (!normalizedPropertyId || seen.has(normalizedPropertyId)) return false;
    seen.add(normalizedPropertyId);
    return true;
  });
}

function orderPropertiesByIds(properties: MobileProperty[], propertyIds: string[]) {
  const byId = new Map(properties.map((property) => [property.id, property] as const));
  const ordered = propertyIds.flatMap((propertyId) => {
    const property = byId.get(propertyId);
    return property ? [property] : [];
  });
  return dedupeSelectedProperties([
    ...ordered,
    ...properties,
  ]);
}

/**
 * WHY:   The mobile assistant must send an exact compare selection to the shared buyer assistant backend.
 * WHAT:  Converts the current property selection rail into the canonical single-select or multi-select request payload.
 * HOW:   Keeps one-property requests backward compatible while preferring `selectedPropertyIds` for 2-3 item comparison sets.
 */
export function buildAssistantSelectionPayload(selectedProperties: MobileProperty[]): AssistantSelectionPayload {
  const propertyIds = uniquePropertyIds(selectedProperties.map((property) => property.id));
  if (propertyIds.length >= 2) {
    return {
      selectedPropertyId: propertyIds[0],
      selectedPropertyIds: propertyIds.slice(0, 3),
    };
  }
  return {
    selectedPropertyId: propertyIds[0],
    selectedPropertyIds: undefined,
  };
}

/**
 * WHY:   Mobile compare replay must keep the selection rail in the same order as the comparison the backend resolved.
 * WHAT:  Resolves the selected property list from one assistant message using comparison ids first, then active property focus, then raw properties.
 * HOW:   Reorders the hydrated property payload by comparison ids when present and otherwise falls back to the message's focused property.
 */
export function readSelectedPropertiesFromAssistantMessage(
  message: Pick<MobileConversationMessage, "properties" | "activePropertyId" | "comparisonPropertyIds"> | null | undefined,
) {
  const properties = dedupeSelectedProperties(message?.properties ?? []);
  if (properties.length === 0) return [] as MobileProperty[];

  const comparisonPropertyIds = uniquePropertyIds(message?.comparisonPropertyIds ?? []);
  if (comparisonPropertyIds.length >= 2) {
    return [] as MobileProperty[];
  }

  const activePropertyId = message?.activePropertyId?.trim();
  if (!activePropertyId) return properties;

  return orderPropertiesByIds(properties, [activePropertyId]);
}

/**
 * WHY:   Comparison turns may return a different property ordering than the local temporary selection state.
 * WHAT:  Reconciles the next selected-property rail from a fresh assistant response.
 * HOW:   Uses compare metadata when available, then active property focus, then the response properties, and finally preserves the previous selection.
 */
export function resolveSelectedPropertiesFromAssistantResponse(args: {
  response: AssistantResponseLike;
  currentSelection: MobileProperty[];
  activeProperty: MobileProperty | null;
}) {
  if (uniquePropertyIds(args.response.comparisonPropertyIds ?? []).length >= 2) {
    return [] as MobileProperty[];
  }

  const nextProperties = readSelectedPropertiesFromAssistantMessage({
    properties: args.response.properties,
    activePropertyId: args.response.activePropertyId,
    comparisonPropertyIds: args.response.comparisonPropertyIds,
  });
  if (nextProperties.length > 0) {
    return nextProperties;
  }

  if (args.activeProperty) {
    return [args.activeProperty];
  }

  return dedupeSelectedProperties(args.currentSelection);
}

/**
 * WHY:   Guest thread restore and authenticated replay should agree on how to derive the active compare rail from saved turns.
 * WHAT:  Reads the latest meaningful selected-property set from the current conversation history.
 * HOW:   Scans backward for the newest assistant or user turn with properties and applies the same compare-first ordering rules.
 */
export function readSelectedPropertiesFromMessages(messages: MobileConversationMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const nextSelection = readSelectedPropertiesFromAssistantMessage(messages[index]);
    if (nextSelection.length > 0) return nextSelection;
  }
  return [] as MobileProperty[];
}

/**
 * WHY:   The compare rail should never show duplicated properties after response reconciliation or local persistence.
 * WHAT:  Removes empty or repeated property ids from a selected-property list.
 * HOW:   Preserves first occurrence order while filtering invalid ids.
 */
export function dedupeSelectedProperties(properties: MobileProperty[]) {
  const seen = new Set<string>();
  return properties.filter((property) => {
    const propertyId = property?.id?.trim();
    if (!propertyId || seen.has(propertyId)) return false;
    seen.add(propertyId);
    return true;
  });
}

export type { AssistantSelectionPayload, AssistantSelectionSource };

import type { MobileProperty } from "@/types/mobile";

/**
 * WHY:   The buyer chat needs one predictable way to turn an active property into a ready-to-edit draft.
 * WHAT:  Builds the default property-specific prompt and applies it onto the current composer draft without duplicating context.
 * HOW:   Returns a full follow-up prompt when the draft is empty and otherwise prefixes the user's draft once with the selected property title.
 */
export function buildActivePropertyPrompt(property: MobileProperty) {
  return `أريد تفاصيل أكثر عن ${property.title}`;
}

/**
 * WHY:   Tapping the composer helper card should guide the user's draft instead of erasing their current thought.
 * WHAT:  Merges the active-property context into the existing draft while avoiding duplicate property prefixes.
 * HOW:   Leaves drafts that already mention the property unchanged, otherwise prefixes non-empty text and falls back to the default property prompt for empty drafts.
 */
export function applyActivePropertyPromptToDraft(draft: string, property: MobileProperty) {
  const trimmedDraft = draft.trim();
  const propertyTitle = property.title.trim();
  const propertyPrefix = `عن ${propertyTitle}:`;

  if (!trimmedDraft) {
    return buildActivePropertyPrompt(property);
  }

  if (trimmedDraft.includes(propertyTitle) || trimmedDraft.startsWith(propertyPrefix)) {
    return trimmedDraft;
  }

  return `${propertyPrefix} ${trimmedDraft}`;
}

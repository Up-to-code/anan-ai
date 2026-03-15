/**
 * WHY:   Verification steps need structured, searchable compliance checklists from ruleset config.
 * WHAT:  Defines the requirement and source types plus a shared filter helper for the UI.
 * HOW:   Keeps the types minimal and ships a case-insensitive search filter.
 */
export type RequirementItem = {
  id: string;
  label: string;
  required: boolean;
  note?: string;
};

export type RequirementSourceLink = {
  id: string;
  label: string;
  url: string;
};

/**
 * WHY:   The requirements list should be searchable by keyword.
 * WHAT:  Filters requirement items by a search query.
 * HOW:   Matches against labels and notes after lowercasing Arabic/Latin input.
 */
export function filterRequirements(items: RequirementItem[], query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return items;
  return items.filter((item) => {
    const haystack = `${item.label} ${item.note ?? ""}`.toLowerCase();
    return haystack.includes(normalized);
  });
}

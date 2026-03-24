export const MEMORY_DEFAULT_TTL_MS = 1000 * 60 * 60 * 24 * 30;

export type LastSearchSummary = {
  query: string;
  location: string | null;
  budgetHint: string | null;
  findingsCount: number;
};

export function buildMemorySummary(
  preferences: unknown[],
  constraints: unknown[],
  interactions: unknown[],
  lastSearchSummary?: LastSearchSummary | null
): string {
  const parts: string[] = [];
  if (preferences.length > 0) {
    const prefStrings = preferences.map((p: unknown) => {
      const memory = p as { key?: string; value?: string };
      return `${memory.key ?? ""}: ${memory.value ?? ""}`.trim();
    });
    parts.push(`User preferences: ${prefStrings.join(", ")}`);
  }

  if (constraints.length > 0) {
    const constraintStrings = constraints.map((c: unknown) => {
      const memory = c as { key?: string; value?: string };
      return `${memory.key ?? ""}: ${memory.value ?? ""}`.trim();
    });
    parts.push(`Constraints: ${constraintStrings.join(", ")}`);
  }

  if (lastSearchSummary) {
    const location = lastSearchSummary.location ? ` in ${lastSearchSummary.location}` : "";
    const budget = lastSearchSummary.budgetHint ? ` (${lastSearchSummary.budgetHint})` : "";
    parts.push(
      `Last search: "${lastSearchSummary.query}"${location}${budget}, ${lastSearchSummary.findingsCount} results`
    );
  }

  if (interactions.length > 0) {
    parts.push(`Recent activity: ${interactions.length} interactions tracked`);
  }

  return parts.join(". ") || "No specific preferences or constraints recorded yet.";
}

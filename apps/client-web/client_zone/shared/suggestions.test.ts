import { describe, expect, it } from "vitest";
import { buildBuyerChatSuggestions } from "./suggestions";

describe("buildBuyerChatSuggestions", () => {
  it("returns four localized prompts for Arabic", () => {
    const suggestions = buildBuyerChatSuggestions("ar");

    expect(suggestions).toHaveLength(4);
    expect(suggestions[0]?.prompt).toContain("اعرض");
  });

  it("returns financing and advisor prompts for English", () => {
    const suggestions = buildBuyerChatSuggestions("en");

    expect(suggestions.map((suggestion) => suggestion.id)).toEqual([
      "budget",
      "finance",
      "compare",
      "advisor",
    ]);
    expect(suggestions[1]?.prompt).toContain("mortgage");
  });

  it("returns French copy for French locale", () => {
    const suggestions = buildBuyerChatSuggestions("fr");

    expect(suggestions[0]?.label).toContain("Riyad");
    expect(suggestions[3]?.prompt).toContain("conseiller");
  });
});

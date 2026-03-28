import { describe, expect, it } from "vitest";
import { buildChatSuggestions } from "./chatSuggestions";

describe("buildChatSuggestions", () => {
  it("keeps production default suggestions free of demo-only prompts", () => {
    const suggestions = buildChatSuggestions("en", "default");

    expect(suggestions).toHaveLength(3);
    expect(suggestions.some((item) => item.prompt.startsWith("__open_demo__:"))).toBe(false);
  });

  it("still exposes search-specific discovery prompts", () => {
    const suggestions = buildChatSuggestions("ar", "search");

    expect(suggestions.map((item) => item.label)).toContain("شقة في الرياض");
    expect(suggestions.map((item) => item.label)).toContain("قارن الخيارات");
  });
});

import { describe, expect, it } from "vitest";
import { SHARED_PROMPT_BLOCKS, buildSystemPrompt } from "./promptPolicy";

describe("promptPolicy", () => {
  it("builds a structured prompt with version metadata", () => {
    const prompt = buildSystemPrompt({
      version: "v9",
      identity: "You are a configured test agent.",
      scope: ["Handle structured tasks."],
      toolUsage: ["Use the registered tools only."],
      output: ["Respond clearly."],
      safety: [SHARED_PROMPT_BLOCKS.noFabrication],
    });

    expect(prompt).toContain("# Identity");
    expect(prompt).toContain("# Prompt Version");
    expect(prompt).toContain("v9");
  });
});

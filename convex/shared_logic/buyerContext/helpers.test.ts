import { describe, expect, it } from "vitest";
import { estimatePromptBudget, selectBuyerSummarySnippets } from "./helpers";

describe("buyerContext helpers", () => {
  it("prioritizes finance snippets for finance intent", () => {
    const snippets = selectBuyerSummarySnippets({
      query: "loan eligibility",
      intent: "finance",
      summaries: {
        buyerProfileSummary: "Buyer profile summary",
        activePropertySummary: "Active property summary",
        searchJourneySummary: "Search journey summary",
        financeQualificationSummary: "Finance qualification summary",
      },
    });

    expect(snippets[0]).toBe("Finance qualification summary");
  });

  it("drops lower-priority blocks when the prompt budget is exceeded", () => {
    const budget = estimatePromptBudget({
      budgetCap: 5,
      cacheHit: false,
      blocks: [
        { name: "priority", text: "one two three four", bucket: "context", priority: 0 },
        { name: "overflow", text: "five six seven eight", bucket: "memory", priority: 1 },
      ],
    });

    expect(budget.includedBlocks).toEqual(["priority"]);
    expect(budget.droppedBlocks).toEqual(["overflow"]);
  });
});

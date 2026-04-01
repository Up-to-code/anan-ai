import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { modules } from "../test.setup";
import { saveConversationStep } from "./services/assistantService";
import { extractConversationDemand } from "./conversationAnalyzer/extract";
import {
  getLatestCompletedConversationAnalyzerWindow,
  getNextConversationAnalyzerWindow,
} from "./conversationAnalyzer/time";

function registerWindowTests() {
  it("maps buyer turns to the next Riyadh noon window and reruns to the latest completed noon window", () => {
    const beforeNoonUtc = Date.UTC(2026, 3, 1, 8, 30, 0, 0); // 11:30 AM Riyadh
    const nextWindow = getNextConversationAnalyzerWindow(beforeNoonUtc);
    expect(new Date(nextWindow.windowEndMs).toISOString()).toBe(
      "2026-04-01T09:00:00.000Z",
    );
    expect(new Date(nextWindow.windowStartMs).toISOString()).toBe(
      "2026-03-31T09:00:00.000Z",
    );

    const afterNoonUtc = Date.UTC(2026, 3, 1, 10, 30, 0, 0); // 1:30 PM Riyadh
    const completedWindow = getLatestCompletedConversationAnalyzerWindow(afterNoonUtc);
    expect(new Date(completedWindow.windowEndMs).toISOString()).toBe(
      "2026-04-01T09:00:00.000Z",
    );
    expect(new Date(completedWindow.windowStartMs).toISOString()).toBe(
      "2026-03-31T09:00:00.000Z",
    );
  });
}

function registerExtractionTests() {
  it("extracts normalized buyer demand signals from a transcript", () => {
    const output = extractConversationDemand({
      threadId: "thread-1",
      userId: "user-1",
      assistantKind: "default",
      messages: [
        {
          role: "user",
          content:
            "أبغى شقة في الملقا بالرياض، 3 غرف، وميزانيتي 1.2 مليون، وأفضل تمويل مع مواقف خاصة. هذا شرط أساسي.",
          createdAt: 1,
        },
        {
          role: "assistant",
          content: "أكيد، هل تفضل السكن أو الاستثمار؟",
          createdAt: 2,
        },
        {
          role: "user",
          content: "للسكن وخلال شهرين بالكثير.",
          createdAt: 3,
        },
      ],
    });

    expect(output.hotCities).toContain("الرياض");
    expect(output.hotAreas).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ city: "الرياض", area: "الملقا" }),
      ]),
    );
    expect(output.propertyTypes).toContain("شقق");
    expect(output.budgetBands).toContain("1 - 2 مليون");
    expect(output.paymentIntents).toContain("mortgage");
    expect(output.bedroomCounts).toContain("3 غرف");
    expect(output.mustHaveFeatures).toContain("مواقف خاصة");
    expect(output.intent).toBe("residential");
    expect(output.timelineSignals).toContain("خلال 1-2 شهر");
  });
}

function registerDraftRegistrationTests() {
  it("registers buyer conversations as analyzer drafts and skips non-buyer workspace conversations", async () => {
    const t = convexTest(schema, modules);

    await t.run(async (ctx) => {
      await saveConversationStep(ctx as never, {
        userId: "buyer-1",
        ownerType: "user",
        userMessage: "أريد شقة في الرياض",
        assistantMessage: "أكيد",
        mode: "qa",
        assistantKind: "default",
      });

      await saveConversationStep(ctx as never, {
        userId: "broker-1",
        ownerType: "broker",
        userMessage: "أضف مشروع جديد",
        assistantMessage: "تم",
        mode: "qa",
        assistantKind: "anan_workspace",
      });

      const rows = await ctx.db.query("aiConversationAnalyses").collect();
      expect(rows).toHaveLength(1);
      expect(rows[0]?.status).toBe("draft");
      expect(rows[0]?.assistantKind).toBe("default");
      expect(rows[0]?.messageCount).toBe(0);
    });
  });
}

describe("conversation analyzer", () => {
  registerWindowTests();
  registerExtractionTests();
  registerDraftRegistrationTests();
});

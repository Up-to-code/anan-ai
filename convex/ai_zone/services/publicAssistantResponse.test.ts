import { describe, expect, it } from "vitest";
import { compactAssistantResponse } from "./publicAssistantResponse";

describe("publicAssistantResponse", () => {
  it("keeps already compact replies intact", () => {
    const result = compactAssistantResponse("هذا رد قصير وواضح. يساعد المستخدم بسرعة.");
    expect(result.changed).toBe(false);
    expect(result.text).toContain("رد قصير");
  });

  it("compacts overly long multi-sentence replies", () => {
    const text = [
      "هذه هي الجملة الأولى التي تقدم الإجابة الأساسية للمستخدم.",
      "هذه الجملة الثانية تضيف توضيحاً مهماً لكنه ما يزال قصيراً.",
      "هذه الجملة الثالثة تستمر في الشرح بطريقة معقولة.",
      "هذه الجملة الرابعة تضيف تفاصيل أقل أهمية.",
      "هذه الجملة الخامسة تضيف أمثلة.",
      "هذه الجملة السادسة يجب أن تُحذف من الرد المضغوط.",
    ].join(" ");

    const result = compactAssistantResponse(text, { softCap: 220, hardCap: 320, maxSentences: 4 });
    expect(result.changed).toBe(true);
    expect(result.sentenceCount).toBeLessThanOrEqual(4);
    expect(result.text).not.toContain("السادسة");
  });
});

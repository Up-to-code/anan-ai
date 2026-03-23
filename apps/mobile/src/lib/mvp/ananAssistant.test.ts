import { describe, expect, it } from "vitest";
import { buildAssistantReply, findProperties } from "@/lib/mvp/ananAssistant";

describe("anan mobile assistant", () => {
  it("returns search properties for a buyer discovery prompt", () => {
    const reply = buildAssistantReply({
      message: "أبحث عن شقة في الرياض بميزانية 1.6 مليون",
      capability: "search",
    });

    expect(reply.properties?.length).toBeGreaterThan(0);
    expect(reply.contextPropertyId).toBeTruthy();
  });

  it("returns finance cards for loan prompts", () => {
    const reply = buildAssistantReply({
      message: "هل راتبي 15000 يؤهلني للتمويل؟",
      capability: "loans",
    });

    expect(reply.cards?.some((card) => card.type === "mortgage_check")).toBe(true);
    expect(reply.cards?.some((card) => card.type === "payment_plan")).toBe(true);
  });

  it("filters property matches by area", () => {
    const results = findProperties("شقة في العقيق");

    expect(results.some((property) => property.area === "العقيق")).toBe(true);
  });
});

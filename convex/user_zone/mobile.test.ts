// @ts-nocheck
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";
import { buildAssistantResponse, buildQualificationNotes } from "./mobile/assistant";
import { buildAiSummary } from "./mobile/feed";

describe("user_zone mobile", () => {
  it("buildAiSummary keeps Arabic-first property context concise", () => {
    const summary = buildAiSummary({
      title: "شقة استثمارية",
      area: "الملقا",
      location: "الرياض",
      beds: 3,
      description: "واجهة شمالية وتشطيب فاخر ومناسب للاستثمار طويل المدى",
    });

    expect(summary).toContain("الملقا");
    expect(summary).toContain("3 غرف");
  });

  it("listFeed returns only published properties with verified owner metadata", async () => {
    const t = convexTest(schema, modules);
    let brokerId: any;

    await t.run(async (ctx) => {
      brokerId = await ctx.db.insert("brokers", {
        name: "Broker One",
        slug: "broker-one",
        isVerified: true,
      });

      await ctx.db.insert("properties", {
        title: "Published unit",
        address: "Riyadh Front",
        brokerId,
        price: 1500000,
        beds: 3,
        baths: 3,
        description: "Published home",
        publicationState: "published",
        media: [{ key: "1", url: "https://example.com/1.jpg", name: "1.jpg" }],
      });

      await ctx.db.insert("properties", {
        title: "Draft unit",
        address: "Hidden",
        brokerId,
        price: 900000,
        beds: 2,
        baths: 2,
        description: "Draft home",
        publicationState: "draft",
      });
    });

    const result = await (t as any).query((api as any)["user_zone/mobile/feed"].listFeed, {
      paginationOpts: { numItems: 10, cursor: null },
    });

    expect(result.page).toHaveLength(1);
    expect(result.page[0]?.title).toBe("Published unit");
    expect(result.page[0]?.owner.isVerified).toBe(true);
  });

  it("buildAssistantResponse emits typed ROI and mortgage cards", () => {
    const result = buildAssistantResponse({
      property: {
        title: "Skyline Residence",
        price: 1200000,
        area: "الصحافة",
        beds: 2,
        baths: 2,
        owner: { name: "Anan Broker", isVerified: true },
      },
      message: "احسب العائد وهل راتبي 15000 يؤهلني؟",
      qualification: {
        monthlySalary: 15000,
        downPayment: 150000,
      },
    });

    expect(result.cards.some((card) => card.type === "roi_summary")).toBe(true);
    expect(result.cards.some((card) => card.type === "mortgage_check")).toBe(true);
  });

  it("createQualifiedHandoff stores a qualified order", async () => {
    const t = convexTest(schema, modules);
    let propertyId: any;
    let redId: any;

    await t.run(async (ctx) => {
      redId = await ctx.db.insert("RED", {
        name: "Developer One",
        slug: "developer-one",
        isVerified: true,
      });

      propertyId = await ctx.db.insert("properties", {
        title: "Qualified lead property",
        address: "Diriyah",
        REDId: redId,
        price: 2300000,
        beds: 4,
        baths: 4,
        description: "Premium villa",
        publicationState: "published",
      });
    });

    const handoff = await (t as any).mutation((api as any)["user_zone/mobile/assistant"].createQualifiedHandoff, {
      propertyId,
      message: "أرغب في التحقق الكامل من الأهلية",
      externalUserId: "mobile-user-1",
      qualification: {
        monthlySalary: 18000,
        downPayment: 250000,
      },
    });

    const storedOrder = await t.run(async (ctx) => ctx.db.get(handoff.orderId));

    expect(handoff.status).toBe("qualified");
    expect((storedOrder as any)?.status).toBe("qualified");
    expect((storedOrder as any)?.sourceChannel).toBe("app");
    expect((storedOrder as any)?.REDId).toEqual(redId);
  });

  it("buildQualificationNotes keeps structured handoff context", () => {
    const notes = buildQualificationNotes(
      "Need pre-approval",
      { monthlySalary: 12000, preferredYears: 20 },
      "Palm Residence",
    );
    expect(notes).toContain("Salary: 12000");
    expect(notes).toContain("Palm Residence");
  });
});

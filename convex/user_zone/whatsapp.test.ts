import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, internal } from "../_generated/api";
import schema from "../schema";
import { modules } from "../test.setup";

async function insertComplianceRuleset(ctx: any) {
  const now = Date.now();
  await ctx.db.insert("complianceRulesets", {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType: "broker",
    status: "active",
    requirements: [],
    sources: [],
    enforcement: {
      blockPublish: true,
      hideUnverified: true,
      showBanner: true,
      requireOrgVerification: true,
      requireListingVerification: true,
    },
    version: 1,
    createdAt: now,
    updatedAt: now,
  });
}

async function seedWhatsAppFixtures(t: ReturnType<typeof convexTest>) {
  return await t.run(async (ctx) => {
    await insertComplianceRuleset(ctx);
    const brokerId = await ctx.db.insert("brokers", {
      name: "WhatsApp Broker",
      slug: "whatsapp-broker",
      isVerified: true,
      countryCode: "SA",
    });

    const propertyId = await ctx.db.insert("properties", {
      title: "Riyadh Garden Apartment",
      address: "Al Yasmin",
      brokerId,
      price: 1250000,
      beds: 3,
      baths: 3,
      area: "الياسمين",
      location: "الرياض",
      description: "Verified apartment close to schools and retail.",
      publicationState: "published",
      adLicenseStatus: "approved",
      media: [{ key: "1", url: "https://example.com/1.jpg", name: "1.jpg" }],
      searchText: "riyadh garden apartment الياسمين الرياض",
    });

    return { propertyId };
  });
}

describe("user_zone whatsapp", () => {
  it("returns search results for a free-text discovery request", async () => {
    const t = convexTest(schema, modules);
    await seedWhatsAppFixtures(t);

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "شقة في الرياض",
      messageType: "text",
    });

    expect(result.turn.state).toBe("search_results");
    expect(result.turn.properties.length).toBeGreaterThan(0);
    expect(result.outboundMessages.some((message: { type: string }) => message.type === "list")).toBe(true);
  });

  it("stores selected property state from an interactive list reply", async () => {
    const t = convexTest(schema, modules);
    const { propertyId } = await seedWhatsAppFixtures(t);

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "شقة في الرياض",
      messageType: "text",
    });

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "Riyadh Garden Apartment",
      messageType: "interactive_list_reply",
      interactiveReplyId: `select_property:${propertyId}`,
      interactiveReplyTitle: "Riyadh Garden Apartment",
    });

    expect(result.turn.state).toBe("property_selected");
    expect(result.turn.selectedPropertyId).toBe(propertyId);
  });

  it("returns finance cards for a selected property", async () => {
    const t = convexTest(schema, modules);
    const { propertyId } = await seedWhatsAppFixtures(t);

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "شقة في الرياض",
      messageType: "text",
    });

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "Riyadh Garden Apartment",
      messageType: "interactive_list_reply",
      interactiveReplyId: `select_property:${propertyId}`,
      interactiveReplyTitle: "Riyadh Garden Apartment",
    });

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "تمويل",
      messageType: "interactive_button_reply",
      interactiveReplyId: "property_action:finance",
      interactiveReplyTitle: "تمويل",
    });

    expect(result.turn.cards.some((card: { type: string }) => card.type === "payment_plan")).toBe(true);
    expect(result.turn.cards.some((card: { type: string }) => card.type === "mortgage_check")).toBe(true);
  });

  it("creates a WhatsApp-qualified order for advisor handoff", async () => {
    const t = convexTest(schema, modules);
    const { propertyId } = await seedWhatsAppFixtures(t);

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "شقة في الرياض",
      messageType: "text",
    });

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "Riyadh Garden Apartment",
      messageType: "interactive_list_reply",
      interactiveReplyId: `select_property:${propertyId}`,
      interactiveReplyTitle: "Riyadh Garden Apartment",
    });

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "مستشار",
      messageType: "interactive_button_reply",
      interactiveReplyId: "property_action:advisor",
      interactiveReplyTitle: "مستشار",
    });

    const orders = await t.run(async (ctx) =>
      ctx.db.query("orders").withIndex("userId", (q) => q.eq("userId", "966501234567")).collect(),
    );

    expect(result.turn.state).toBe("handoff_ready");
    expect(orders[0]?.sourceChannel).toBe("whatsapp");
    expect(orders[0]?.intent).toBe("whatsapp_ai_handoff");
  });

  it("treats a fresh free-text message as a new search after property selection", async () => {
    const t = convexTest(schema, modules);
    const { propertyId } = await seedWhatsAppFixtures(t);

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "شقة في الرياض",
      messageType: "text",
    });

    await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "Riyadh Garden Apartment",
      messageType: "interactive_list_reply",
      interactiveReplyId: `select_property:${propertyId}`,
      interactiveReplyTitle: "Riyadh Garden Apartment",
    });

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "فلل في الرياض",
      messageType: "text",
    });

    expect(result.turn.state).toBe("search_results");
    expect(result.turn.selectedPropertyId).toBeUndefined();
  });

  it("falls back to featured feed results when direct search misses", async () => {
    const t = convexTest(schema, modules);
    await seedWhatsAppFixtures(t);

    const result = await (t as any).action((internal as any)["user_zone/whatsapp/index"].generateBuyerReply, {
      userId: "966501234567",
      message: "عقار غير موجود تماما",
      messageType: "text",
    });

    expect(result.turn.properties.length).toBeGreaterThan(0);
    expect(result.turn.message).toContain("أقرب العقارات");
  });
});

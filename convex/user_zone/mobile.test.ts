import { convexTest } from "convex-test";
import { describe, expect, it, vi } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";
import { buildAssistantResponse, buildQualificationNotes } from "./mobile/assistant";
import { buildAiSummary } from "./mobile/feed";

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

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

async function seedFeedFixtures(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await insertComplianceRuleset(ctx);
    const brokerId = await ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one", isVerified: true });
    await ctx.db.insert("properties", {
      title: "Published unit",
      address: "Riyadh Front",
      brokerId,
      price: 1500000,
      beds: 3,
      baths: 3,
      description: "Published home",
      publicationState: "published",
      adLicenseStatus: "approved",
      media: [{ key: "1", url: "https://example.com/1.jpg", name: "1.jpg" }],
    });
    await ctx.db.insert("properties", { title: "Draft unit", address: "Hidden", brokerId, price: 900000, beds: 2, baths: 2, description: "Draft home", publicationState: "draft" });
  });
}

async function seedQualifiedHandoffFixtures(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => {
    const redId = await ctx.db.insert("RED", { name: "Developer One", slug: "developer-one", isVerified: true });
    const propertyId = await ctx.db.insert("properties", {
      title: "Qualified lead property",
      address: "Diriyah",
      REDId: redId,
      price: 2300000,
      beds: 4,
      baths: 4,
      description: "Premium villa",
      publicationState: "published",
    });
    return { redId, propertyId };
  });
}

async function seedAuthenticatedBuyer(
  t: ReturnType<typeof convexTest>,
  args: { authUserId: string; email: string; name: string },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      role: "user",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

async function seedPublishedProperty(t: ReturnType<typeof convexTest>, title: string) {
  return t.run(async (ctx) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: `${title} Broker`,
      slug: `${title.toLowerCase().replace(/\s+/g, "-")}-broker`,
      isVerified: true,
    } as any);
    return ctx.db.insert("properties", {
      title,
      address: "Riyadh",
      brokerId,
      price: 1100000,
      beds: 3,
      baths: 3,
      description: `${title} description`,
      publicationState: "published",
      adLicenseStatus: "approved",
    } as any);
  });
}

function registerBuildAiSummaryTest() {
  it("buildAiSummary keeps Arabic-first property context concise", () => {
    const summary = buildAiSummary({ title: "شقة استثمارية", area: "الملقا", location: "الرياض", beds: 3, description: "واجهة شمالية وتشطيب فاخر ومناسب للاستثمار طويل المدى" });
    expect(summary).toContain("الملقا");
    expect(summary).toContain("3 غرف");
  });
}

function registerListFeedTest() {
  it("listFeed returns only published properties with verified owner metadata", async () => {
    const t = convexTest(schema, modules);
    await seedFeedFixtures(t);

    const result = await (t as any).query((api as any)["user_zone/mobile/feed"].listFeed, {
      paginationOpts: { numItems: 10, cursor: null },
    });

    expect(result.page).toHaveLength(1);
    expect(result.page[0]?.title).toBe("Published unit");
    expect(result.page[0]?.owner.isVerified).toBe(true);
  });

  it("getPropertyDetail returns the published mobile property dto", async () => {
    const t = convexTest(schema, modules);
    await seedFeedFixtures(t);

    const propertyId = await t.run(async (ctx) => {
      const property = await ctx.db
        .query("properties")
        .withIndex("publicationState", (q: any) => q.eq("publicationState", "published"))
        .first();
      return property?._id;
    });

    const result = await (t as any).query((api as any)["user_zone/mobile/feed"].getPropertyDetail, {
      propertyId,
    });

    expect(result?.title).toBe("Published unit");
    expect(result?.media[0]).toContain("https://");
  });
}

function registerAssistantCardsTest() {
  it("buildAssistantResponse emits typed ROI and mortgage cards", () => {
    const result = buildAssistantResponse({
      property: { title: "Skyline Residence", price: 1200000, area: "الصحافة", beds: 2, baths: 2, owner: { name: "Anan Broker", isVerified: true } },
      message: "احسب العائد وهل راتبي 15000 يؤهلني؟",
      qualification: { monthlySalary: 15000, downPayment: 150000 },
    });

    expect(result.cards.some((card) => card.type === "roi_summary")).toBe(true);
    expect(result.cards.some((card) => card.type === "mortgage_check")).toBe(true);
  });

  it("buildAssistantResponse emits a comparison baseline aligned with the newer comparison metrics", () => {
    const result = buildAssistantResponse({
      property: {
        title: "Skyline Residence",
        price: 1200000,
        area: "الصحافة",
        beds: 2,
        baths: 2,
        sqft: 145,
        status: "جاهز",
        owner: { name: "Anan Broker", isVerified: true },
        finance: { bankOfferCount: 3 },
      },
      message: "أريد مقارنة",
    });

    const comparisonCard = result.cards.find((card) => card.type === "comparison_table");
    expect(comparisonCard).toBeTruthy();
    expect(comparisonCard?.columns).toEqual(["البند", "Skyline Residence"]);
    expect(comparisonCard?.rows.some((row: string[]) => row[0] === "التمويل" && row[1]?.includes("3"))).toBe(true);
  });
}

function registerQualifiedHandoffTest() {
  it("createQualifiedHandoff stores a qualified order", async () => {
    vi.useFakeTimers();
    const t = convexTest(schema, modules);
    const { redId, propertyId } = await seedQualifiedHandoffFixtures(t);

    try {
      const handoff = await (t as any).mutation((api as any)["user_zone/mobile/assistant"].createQualifiedHandoff, {
        propertyId,
        message: "أرغب في التحقق الكامل من الأهلية",
        externalUserId: "mobile-user-1",
        qualification: { monthlySalary: 18000, downPayment: 250000 },
      });

      const storedOrder = await t.run(async (ctx) => ctx.db.get(handoff.orderId));

      expect(handoff.status).toBe("qualified");
      expect((storedOrder as any)?.status).toBe("qualified");
      expect((storedOrder as any)?.sourceChannel).toBe("app");
      expect((storedOrder as any)?.REDId).toEqual(redId);

      await t.finishAllScheduledFunctions(() => {
        vi.advanceTimersByTime(1);
      });
    } finally {
      vi.useRealTimers();
    }
  });
}

function registerQualificationNotesTest() {
  it("buildQualificationNotes keeps structured handoff context", () => {
    const notes = buildQualificationNotes("Need pre-approval", { monthlySalary: 12000, preferredYears: 20 }, "Palm Residence");
    expect(notes).toContain("Salary: 12000");
    expect(notes).toContain("Palm Residence");
  });
}

function registerMobileAccountBackendTests() {
  it("returns authenticated mobile account defaults for signed-in buyers without a stored account row", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({
      subject: "mobile-auth-1",
      email: "buyer@example.com",
      name: "Real Buyer",
    });
    await seedAuthenticatedBuyer(t, {
      authUserId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    const viewer = await t.withIdentity(identity).query((api as any)["user_zone/mobile/account"].getAccount, {});

    expect(viewer?.displayName).toBe("Real Buyer");
    expect(viewer?.savedPropertyIds).toEqual([]);
    expect(viewer?.preferences.locale).toBe("ar");
    expect(viewer?.preferences.financeDefaults).toEqual({
      downPaymentPercent: 10,
      preferredYears: 20,
      annualRate: 4.75,
    });

    await t.finishInProgressScheduledFunctions();
  });

  it("persists saved properties, preferences, and consents inside the dedicated mobile buyer account", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({
      subject: "mobile-auth-2",
      email: "buyer2@example.com",
      name: "Buyer Two",
    });
    await seedAuthenticatedBuyer(t, {
      authUserId: identity.subject,
      email: identity.email,
      name: identity.name,
    });
    const propertyId = await seedPublishedProperty(t, "Residences One");

    await t.withIdentity(identity).mutation((api as any)["user_zone/mobile/account"].toggleSavedProperty, {
      propertyId: String(propertyId),
    });
    await t.withIdentity(identity).mutation((api as any)["user_zone/mobile/account"].updatePreferences, {
      locale: "en",
      financeDefaults: {
        downPaymentPercent: 25,
      },
    });
    await t.withIdentity(identity).mutation((api as any)["user_zone/mobile/account"].updateConsents, {
      consents: {
        privacyAcceptedAt: 111,
      },
    });

    const viewer = await t.withIdentity(identity).query((api as any)["user_zone/mobile/account"].getAccount, {});

    expect(viewer?.savedPropertyIds).toEqual([String(propertyId)]);
    expect(viewer?.preferences.locale).toBe("en");
    expect(viewer?.preferences.financeDefaults.downPaymentPercent).toBe(25);
    expect(viewer?.preferences.financeDefaults.preferredYears).toBe(20);
    expect(viewer?.consents.privacyAcceptedAt).toBe(111);

    const storedProfile = await t.run((ctx) =>
      ctx.db.query("userProfiles").withIndex("authUserId", (q: any) => q.eq("authUserId", identity.subject)).first(),
    );
    expect((storedProfile as any)?.name).toBe("Buyer Two");

    await t.finishInProgressScheduledFunctions();
  });

  it("merges guest local mobile state into the backend account without overwriting a real identity name with the guest placeholder", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({
      subject: "mobile-auth-3",
      email: "buyer3@example.com",
      name: "Buyer Three",
    });
    await seedAuthenticatedBuyer(t, {
      authUserId: identity.subject,
      email: identity.email,
      name: identity.name,
    });
    const propertyId = await seedPublishedProperty(t, "Palm Heights");

    await t.withIdentity(identity).mutation((api as any)["user_zone/mobile/account"].mergeGuestLocalState, {
      state: {
        profile: {
          displayName: "ضيف عنان",
          phone: "+966500000000",
          email: "guest-override@example.com",
        },
        savedPropertyIds: [String(propertyId)],
        consents: {
          privacyAcceptedAt: 100,
          termsAcceptedAt: 120,
        },
        preferences: {
          locale: "en",
          onboardingCompletedAt: 200,
          authEntryDismissedAt: 210,
          financeDefaults: {
            downPaymentPercent: 30,
            preferredYears: 15,
            annualRate: 5.5,
          },
        },
      },
    });

    const viewer = await t.withIdentity(identity).query((api as any)["user_zone/mobile/account"].getAccount, {});

    expect(viewer?.displayName).toBe("Buyer Three");
    expect(viewer?.phone).toBe("+966500000000");
    expect(viewer?.email).toBe("guest-override@example.com");
    expect(viewer?.savedPropertyIds).toEqual([String(propertyId)]);
    expect(viewer?.consents.termsAcceptedAt).toBe(120);
    expect(viewer?.preferences.locale).toBe("en");
    expect(viewer?.preferences.financeDefaults).toEqual({
      downPaymentPercent: 30,
      preferredYears: 15,
      annualRate: 5.5,
    });

    await t.finishInProgressScheduledFunctions();
  });

  it("hydrates authenticated comparison turns from compact message metadata", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({
      subject: "mobile-auth-compare-1",
      email: "compare@example.com",
      name: "Compare Buyer",
    });
    await seedAuthenticatedBuyer(t, {
      authUserId: identity.subject,
      email: identity.email,
      name: identity.name,
    });
    await t.run(insertComplianceRuleset);

    const firstPropertyId = await seedPublishedProperty(t, "Palm Heights");
    const secondPropertyId = await seedPublishedProperty(t, "Dunes Court");

    await t.run(async (ctx) => {
      const threadId = await ctx.db.insert("assistantThreads", {
        userId: identity.subject,
        scope: "user",
        ownerType: "user",
        mode: "qa",
        assistantKind: "anan_main_public",
        title: "Compare Palm Heights and Dunes Court",
        createdAt: 1,
        updatedAt: 2,
      } as any);

      const artifactId = await ctx.db.insert("buyerComparisonArtifacts", {
        threadId,
        userId: identity.subject,
        channel: "app",
        locale: "en",
        propertyIds: [firstPropertyId, secondPropertyId],
        selectionSource: "ui_selected",
        digestTitle: "Property comparison",
        digestSummary: "Saved comparison snapshot",
        digestHash: "cmp_seed",
        version: "v1",
        snapshot: {
          message: "Stale comparison snapshot",
          cards: [
            {
              type: "comparison_table",
              title: "Property comparison",
              columns: ["Metric", "Old A", "Old B"],
              rows: [["Price", "1", "2"]],
              summary: "stale",
            },
          ],
          properties: [],
          activePropertyId: firstPropertyId,
          suggestedPrompts: ["Explain the best option"],
        },
        createdAt: 3,
        lastRefreshedAt: 3,
      } as any);

      await ctx.db.insert("assistantMessages", {
        threadId,
        role: "assistant",
        content: "Compact comparison metadata only",
        mode: "qa",
        metadata: {
          comparisonArtifactId: artifactId,
          comparisonPropertyIds: [firstPropertyId, secondPropertyId],
          selectionSource: "ui_selected",
        },
        createdAt: 4,
      } as any);
    });

    const state = await t.withIdentity(identity).query((api as any)["user_zone/mobile/account"].getAssistantState, {});
    const assistantMessage = state.activeMessages[0];
    const comparisonCard = assistantMessage?.cards?.find((card: any) => card.type === "comparison_table");

    expect(state.activeThreadId).toBeTruthy();
    expect(assistantMessage?.comparisonArtifactId).toBeTruthy();
    expect(assistantMessage?.properties?.map((property: any) => property.title)).toEqual([
      "Palm Heights",
      "Dunes Court",
    ]);
    expect(comparisonCard?.columns).toEqual(["Metric", "Palm Heights", "Dunes Court"]);
    expect(assistantMessage?.text).toContain("Palm Heights");

    await t.finishInProgressScheduledFunctions();
  });

  it("keeps authenticated fresh mobile sends detached from the latest saved assistant thread", async () => {
    const t = convexTest(schema, modules);
    const identity = makeIdentity({
      subject: "mobile-auth-fresh-1",
      email: "fresh@example.com",
      name: "Fresh Buyer",
    });
    await seedAuthenticatedBuyer(t, {
      authUserId: identity.subject,
      email: identity.email,
      name: identity.name,
    });

    await t.run(async (ctx) => {
      const threadId = await ctx.db.insert("assistantThreads", {
        userId: identity.subject,
        scope: "user",
        ownerType: "user",
        mode: "qa",
        assistantKind: "anan_main_public",
        title: "Previous conversation",
        createdAt: 1,
        updatedAt: 3,
      } as any);

      await ctx.db.insert("assistantMessages", {
        threadId,
        role: "user",
        content: "Old question",
        mode: "qa",
        createdAt: 2,
      } as any);

      await ctx.db.insert("assistantMessages", {
        threadId,
        role: "assistant",
        content: "Old answer",
        mode: "qa",
        createdAt: 3,
      } as any);

      await ctx.db.insert("buyerChannelStates", {
        channel: "web",
        userId: identity.subject,
        threadId,
        state: "property_selected",
        selectedPropertyId: undefined,
        lastResultPropertyIds: [],
        lastSearchQuery: "old saved query",
        createdAt: 4,
        updatedAt: 4,
      } as any);

      await ctx.db.insert("agentMemory", {
        userId: identity.subject,
        threadId: String(threadId),
        key: "buyer_memory",
        value: "Old buyer memory",
        metadata: { channel: "web" },
        createdAt: 5,
        updatedAt: 5,
      } as any);
    });

    const runtime = await t.withIdentity(identity).query((api as any).ai_zone.assistantPublic.getRuntimeContextBundle, {
      message: "Brand new request",
      startFresh: true,
    });

    expect(runtime.thread).toBeNull();
    expect(runtime.existingMessages).toEqual([]);
    expect(runtime.compiledBuyerContext.state).toBeNull();
    expect(runtime.compiledBuyerContext.memory.summary).toBe("");
    expect(runtime.compiledBuyerContext.alreadyShownPropertyIds).toEqual([]);
    expect(runtime.compiledBuyerContext.activeComparisonPropertyIds).toEqual([]);

    await t.finishInProgressScheduledFunctions();
  });
}

function registerMobileTests() {
  registerBuildAiSummaryTest();
  registerListFeedTest();
  registerAssistantCardsTest();
  registerQualifiedHandoffTest();
  registerQualificationNotesTest();
  registerMobileAccountBackendTests();
}

describe("user_zone mobile", registerMobileTests);

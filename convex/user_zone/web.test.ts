import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";
import { ensureProjectDossierForProperty } from "../shared_logic/projects/migrations";
import { recomputeProjectReadinessForProperty } from "../shared_logic/projects/readiness";

async function insertComplianceRuleset(ctx: any, orgType: "broker" | "red" = "broker") {
  const now = Date.now();
  await ctx.db.insert("complianceRulesets", {
    countryCode: "SA",
    countryLabel: "المملكة العربية السعودية",
    orgType,
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

async function seedWebFixtures(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await insertComplianceRuleset(ctx, "broker");
    await insertComplianceRuleset(ctx, "red");
    const brokerId = await ctx.db.insert("brokers", {
      name: "Web Broker",
      slug: "web-broker",
      isVerified: true,
      countryCode: "SA",
      description: "وسيط جاهز للمتابعة مع العميل حتى الزيارة والتمويل.",
      notes: JSON.stringify({ agencyLabel: "شركة وسيط الويب", rating: 4.9 }),
    });
    const bankId = await ctx.db.insert("banks", {
      name: "Bank Web",
      slug: "bank-web",
      contactEmail: "bank@example.com",
      status: "active",
      products: [
        {
          name: "تمويل الشقق",
          type: "mortgage",
          description: "منتج تمويلي اختباري",
          rules: { interestRate: 4.2, minDownPaymentPercent: 10 },
        },
      ],
    });

    const propertyId = await ctx.db.insert("properties", {
      title: "Riyadh Garden Apartment",
      address: "Al Yasmin",
      brokerId,
      bankId,
      price: 1250000,
      beds: 3,
      baths: 3,
      area: "الياسمين",
      location: "الرياض",
      description: "Verified apartment close to schools and retail.",
      publicationState: "published",
      adLicenseStatus: "approved",
      ownerVerified: true,
      listingVerified: true,
      media: [{ key: "1", url: "https://example.com/1.jpg", name: "1.jpg" }],
      searchText: "riyadh garden apartment الياسمين الرياض",
    });
    const { dossierId } = await ensureProjectDossierForProperty(ctx, propertyId, {
      includeLegacyUnitAndPaymentPlan: true,
      requestedVisibility: "public",
    });
    await ctx.db.insert("projectBrokerAuthorizations", {
      dossierId,
      propertyId,
      brokerId,
      channels: ["website", "whatsapp"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    await recomputeProjectReadinessForProperty(ctx, propertyId);
    await ctx.db.patch(propertyId, {
      publicationState: "published",
      isPublicSearchable: true,
    } as any);
  });
}

describe("user_zone web", () => {
  it("returns a published property detail for the client web app", async () => {
    const t = convexTest(schema, modules);
    await seedWebFixtures(t);

    const propertyId = await t.run(async (ctx) =>
      ctx.db
        .query("properties")
        .withIndex("publicationState", (q) => q.eq("publicationState", "published"))
        .first(),
    );
    expect(propertyId).not.toBeNull();

    const result = await (t as any).query((api as any)["user_zone/web/properties"].getPropertyDetail, {
      propertyId: propertyId!._id,
    });

    expect(result?.title).toBe("Riyadh Garden Apartment");
    expect(result?.owner.isVerified).toBe(true);
  });

  it("builds deterministic search and finance cards for the client assistant", async () => {
    const t = convexTest(schema, modules);
    await seedWebFixtures(t);
    const property = await t.run(async (ctx) =>
      ctx.db
        .query("properties")
        .withIndex("publicationState", (q) => q.eq("publicationState", "published"))
        .first(),
    );
    expect(property).not.toBeNull();

    const result = await (t as any).action((api as any)["user_zone/web/assistant"].askClientAssistant, {
      message: "أحتاج تمويل لهذا العقار وأريد الوسيط وأفضل بنك",
      locale: "ar",
      selectedPropertyId: property!._id,
      qualification: { monthlySalary: 15000, downPayment: 150000 },
    });

    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.suggestedPrompts.length).toBeGreaterThan(0);
    expect(typeof result.message).toBe("string");
    expect(result.cards.some((card: any) => card.type === "loan_calculator")).toBe(true);
    expect(result.cards.some((card: any) => card.type === "bank_offer")).toBe(true);
    expect(result.cards.some((card: any) => card.type === "broker_profile")).toBe(true);
  });

  it("seeds the Arabic development ecosystem idempotently", async () => {
    const t = convexTest(schema, modules);

    const firstRun = await (t as any).mutation((api as any).seed.seedArabicDevelopmentEcosystem, {});
    const secondRun = await (t as any).mutation((api as any).seed.seedArabicDevelopmentEcosystem, {});

    expect(firstRun.ok).toBe(true);
    expect(secondRun.ok).toBe(true);

    const publishedProperties = await t.run(async (ctx) =>
      ctx.db.query("properties").withIndex("publicationState", (q) => q.eq("publicationState", "published")).collect(),
    );
    const banks = await t.run(async (ctx) => ctx.db.query("banks").collect());

    expect(publishedProperties.length).toBeGreaterThan(0);
    expect(banks.length).toBeGreaterThan(0);
  });
});

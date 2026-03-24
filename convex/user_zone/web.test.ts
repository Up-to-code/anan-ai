import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
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

async function seedWebFixtures(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    await insertComplianceRuleset(ctx);
    const brokerId = await ctx.db.insert("brokers", {
      name: "Web Broker",
      slug: "web-broker",
      isVerified: true,
      countryCode: "SA",
    });

    await ctx.db.insert("properties", {
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
      message: "أحتاج تمويل لهذا العقار",
      locale: "ar",
      selectedPropertyId: property!._id,
      qualification: { monthlySalary: 15000, downPayment: 150000 },
    });

    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.suggestedPrompts.length).toBeGreaterThan(0);
    expect(typeof result.message).toBe("string");
  });
});

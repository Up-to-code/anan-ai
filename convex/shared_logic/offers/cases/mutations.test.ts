import { expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { api } from "../../../_generated/api";
import { modules } from "../../../test.setup";
import { recomputeProjectReadinessForProperty } from "../../projects/readiness";

const mockRequireRole = vi.fn();
const mockRequireOrganizationMembership = vi.fn();

vi.mock("../../../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
}));

vi.mock("../../agencies/repositories/membership", () => ({
  requireOrganizationMembership: mockRequireOrganizationMembership,
}));

function setBrokerAccess(brokerId: string) {
  mockRequireRole.mockResolvedValue({
    authUserId: "auth-1",
    role: "broker",
    brokerId,
    REDId: undefined,
    profile: { authUserId: "auth-1", brokerId },
  });
  mockRequireOrganizationMembership.mockResolvedValue({
    owner: {
      ownerType: "broker",
      ownerBrokerId: brokerId,
      tenantOrgId: "tenant-1",
    },
    profile: {
      authUserId: "auth-1",
    },
    membership: {
      role: "manager",
      status: "active",
    },
  });
}

async function seedBrokerProperty(t: ReturnType<typeof convexTest>) {
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one", isVerified: true }),
  );
  const propertyId = await t.run(async (ctx) => {
    const id = await ctx.db.insert("properties", {
      title: "Offer Property",
      address: "Riyadh",
      location: "Riyadh",
      area: "Al Malqa",
      description: "Offer test",
      price: 100,
      beds: 2,
      baths: 1,
      brokerId,
      publicationState: "published",
      ownerVerified: true,
      adLicenseStatus: "approved",
      listingVerified: true,
      searchText: "Offer Property Riyadh Offer test",
    } as any);
    const now = Date.now();
    const dossierId = await ctx.db.insert("projectDossiers", {
      propertyId: id,
      ownerType: "broker",
      ownerBrokerId: brokerId,
      projectType: "ready_property",
      salesMode: "broker_owned",
      lifecycleStage: "draft",
      requestedVisibility: "public",
      readinessStatus: "incomplete",
      readinessBlockers: [],
      readinessWarnings: [],
      completedRequirements: [],
      location: { countryCode: "SA", city: "Riyadh", district: "Al Malqa", confidence: "legacy" },
      title: "Offer Property",
      legacyPublicationState: "published",
      createdAt: now,
      updatedAt: now,
    } as any);
    await ctx.db.insert("projectUnits", {
      dossierId,
      propertyId: id,
      label: "Primary unit type",
      unitKind: "unit_type",
      status: "available",
      bedrooms: 2,
      bathrooms: 1,
      price: 100,
      createdAt: now,
      updatedAt: now,
    } as any);
    await ctx.db.insert("projectPaymentPlans", {
      dossierId,
      propertyId: id,
      title: "Default cash price",
      cashPrice: 100,
      startingPrice: 100,
      milestones: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    } as any);
    await ctx.db.insert("projectBrokerAuthorizations", {
      dossierId,
      propertyId: id,
      brokerId,
      channels: ["broker_network"],
      status: "active",
      createdAt: now,
      updatedAt: now,
    } as any);
    await ctx.db.patch(id, { projectDossierId: dossierId } as any);
    await recomputeProjectReadinessForProperty(ctx, id);
    await ctx.db.patch(id, { publicationState: "published", isPublicSearchable: true } as any);
    return id;
  });
  return { brokerId, propertyId };
}

async function seedOrganizationAsset(t: ReturnType<typeof convexTest>, key: string) {
  await t.run((ctx) =>
    ctx.db.insert("organizationAssets", {
      tenantOrgId: "tenant-1",
      uploaderAuthUserId: "auth-1",
      category: "offer_attachment",
      kind: "image",
      key,
      url: `https://files.test/${key}.png`,
      name: `${key}.png`,
      size: 1024,
      mime: "image/png",
      lifecycleState: "active",
      visibilityScope: "organization",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }),
  );
}

it("attaches offer attachments to the offer case on create", async () => {
  const t = convexTest(schema, modules);
  const { brokerId, propertyId } = await seedBrokerProperty(t);
  setBrokerAccess(String(brokerId));

  await seedOrganizationAsset(t, "file-1");

  const result: any = await t.mutation(
    api.shared_logic.offers.createOffer as never,
    {
      propertyId,
      price: 1000,
      message: "Offer title",
      description: "Offer description",
      caseType: "open_offer",
      attachments: [
        {
          key: "file-1",
          url: "https://files.test/file-1.png",
          name: "file-1.png",
          size: 1024,
          mime: "image/png",
        },
      ],
    } as never,
  );

  const assets = await t.run((ctx) =>
    ctx.db.query("organizationAssets").withIndex("key", (q) => q.eq("key", "file-1")).collect(),
  );
  expect(assets[0]?.attachedEntityType).toBe("offer");
  expect(assets[0]?.attachedEntityId).toBe(result.offerId);
});

it("attaches offer attachments to the offer case on update", async () => {
  const t = convexTest(schema, modules);
  const { brokerId, propertyId } = await seedBrokerProperty(t);
  setBrokerAccess(String(brokerId));

  const created: any = await t.mutation(
    api.shared_logic.offers.createOffer as never,
    {
      propertyId,
      price: 900,
      message: "Draft offer",
      description: "Draft description",
      caseType: "open_offer",
      attachments: [],
    } as never,
  );

  await seedOrganizationAsset(t, "file-2");

  await t.mutation(
    api.shared_logic.offers.updateOfferDraft as never,
    {
      id: created.offerId,
      propertyId,
      price: 1200,
      message: "Updated offer",
      description: "Updated description",
      attachments: [
        {
          key: "file-2",
          url: "https://files.test/file-2.png",
          name: "file-2.png",
          size: 2048,
          mime: "image/png",
        },
      ],
    } as never,
  );

  const assets = await t.run((ctx) =>
    ctx.db.query("organizationAssets").withIndex("key", (q) => q.eq("key", "file-2")).collect(),
  );
  expect(assets[0]?.attachedEntityType).toBe("offer");
  expect(assets[0]?.attachedEntityId).toBe(created.offerId);
});

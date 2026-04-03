import { expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { api } from "../../../_generated/api";
import { modules } from "../../../test.setup";

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
  const propertyId = await t.run((ctx) =>
    ctx.db.insert("properties", {
      title: "Offer Property",
      address: "Riyadh",
      description: "Offer test",
      price: 100,
      beds: 2,
      baths: 1,
      brokerId,
      publicationState: "draft",
      searchText: "Offer Property Riyadh Offer test",
    } as any),
  );
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

  const result = await t.mutation(
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

  const created = await t.mutation(
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

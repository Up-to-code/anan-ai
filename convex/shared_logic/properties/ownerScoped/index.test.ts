import { expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../../schema";
import { modules } from "../../../test.setup";
import {
  countOwnerScopedProperties,
  createOwnerScopedProperty,
  deleteOwnerScopedProperty,
  listOwnerScopedProperties,
  publishOwnerScopedProperty,
  updateOwnerScopedProperty,
} from "./index";
import { recomputeProjectReadinessForProperty } from "../../projects/readiness";

it("keeps broker and RED property counts isolated in the shared owner-scoped helper", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: "Broker Shared",
      slug: "broker-shared",
    } as any);
    const redId = await ctx.db.insert("RED", {
      name: "Developer Shared",
      slug: "developer-shared",
    } as any);

    await Promise.all([
      ctx.db.insert("properties", {
        title: "Broker Property",
        address: "Riyadh",
        price: 100,
        beds: 3,
        baths: 2,
        description: "Broker-owned",
        searchText: "Broker Property Riyadh Broker-owned",
        brokerId,
        publicationState: "draft",
      } as any),
      ctx.db.insert("properties", {
        title: "Developer Property",
        address: "Jeddah",
        price: 200,
        beds: 4,
        baths: 3,
        description: "Developer-owned",
        searchText: "Developer Property Jeddah Developer-owned",
        REDId: redId,
        publicationState: "draft",
      } as any),
    ]);

    const brokerPage = await listOwnerScopedProperties(ctx, {
      ownerField: "brokerId",
      ownerId: brokerId,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    const redPage = await listOwnerScopedProperties(ctx, {
      ownerField: "REDId",
      ownerId: redId,
      paginationOpts: { cursor: null, numItems: 10 },
    });
    const brokerCount = await countOwnerScopedProperties(ctx, {
      ownerField: "brokerId",
      ownerId: brokerId,
    });

    expect(brokerPage.page).toHaveLength(1);
    expect((brokerPage.page[0] as any).brokerId).toBe(brokerId);
    expect(redPage.page).toHaveLength(1);
    expect((redPage.page[0] as any).REDId).toBe(redId);
    expect(brokerCount.properties).toBe(1);
  });
});

it("rebuilds search text and publication state through the shared owner-scoped helper", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: "Broker Shared Writer",
      slug: "broker-shared-writer",
    } as any);

    const propertyId = await createOwnerScopedProperty(ctx, {
      ownerField: "brokerId",
      ownerId: brokerId,
      title: "Shared Villa",
      address: "Riyadh",
      description: "Initial description",
      price: 100,
      beds: 3,
      baths: 2,
    });

    await updateOwnerScopedProperty(ctx, {
      id: propertyId,
      description: "Updated description",
    });
    const property = await ctx.db.get(propertyId);
    const dossier = property?.projectDossierId ? await ctx.db.get(property.projectDossierId) : null;
    await ctx.db.patch(propertyId, {
      ownerVerified: true,
      adLicenseStatus: "approved",
      listingVerified: true,
    } as any);
    await ctx.db.insert("projectBrokerAuthorizations", {
      dossierId: dossier?._id,
      propertyId,
      brokerId,
      channels: ["broker_network"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
    await recomputeProjectReadinessForProperty(ctx, propertyId);
    await publishOwnerScopedProperty(ctx, { id: propertyId });

    const published = await ctx.db.get(propertyId);
    expect(published?.publicationState).toBe("published");
    expect(published?.searchText).toContain("Updated description");

    await deleteOwnerScopedProperty(ctx, { id: propertyId });
    expect(await ctx.db.get(propertyId)).toBeNull();
  });
});

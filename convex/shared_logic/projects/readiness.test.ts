import { expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { modules } from "../../test.setup";
import { ensureProjectDossierForProperty } from "./migrations";
import {
  getOwnedProjectDossierDetail,
  requestOwnedProjectPublication,
  saveOwnedProjectComplianceDocuments,
  saveOwnedProjectDossierDraft,
  saveOwnedProjectPaymentPlans,
  saveOwnedProjectUnits,
} from "./operations";
import { computeProjectReadiness, recomputeProjectReadinessForProperty } from "./readiness";

it("creates exactly one dossier for a legacy property and blocks public readiness when required Saudi evidence is missing", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const propertyId = await ctx.db.insert("properties", {
      title: "Legacy Public Project",
      address: "Riyadh",
      location: "Riyadh",
      area: "Al Malqa",
      description: "Legacy published property",
      price: 1_250_000,
      beds: 3,
      baths: 3,
      publicationState: "published",
      ownerType: "RED",
      searchText: "Legacy Public Project Riyadh",
    });

    const first = await ensureProjectDossierForProperty(ctx, propertyId, {
      forcePrivateUntilReady: true,
    });
    const second = await ensureProjectDossierForProperty(ctx, propertyId, {
      forcePrivateUntilReady: true,
    });
    const dossiers = await ctx.db
      .query("projectDossiers")
      .withIndex("propertyId", (q: any) => q.eq("propertyId", propertyId))
      .collect();

    expect(first.dossierId).toBe(second.dossierId);
    expect(dossiers).toHaveLength(1);
    expect(first.readiness.canPublish).toBe(false);
    expect(first.readiness.status).toBe("incomplete");
    expect(first.readiness.blockers.map((item) => item.code)).toContain("AD_LICENSE_REQUIRED");
  });
});

it("saves dossier truth first, regenerates the property projection, and blocks publication with actionable readiness", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const redId = await ctx.db.insert("RED", {
      name: "Dossier Developer",
      slug: "dossier-developer",
    } as any);
    const propertyId = await ctx.db.insert("properties", {
      title: "Legacy Name",
      address: "Legacy Address",
      location: "Riyadh",
      area: "Old District",
      description: "Legacy description",
      price: 900_000,
      beds: 2,
      baths: 2,
      publicationState: "draft",
      ownerType: "RED",
      REDId: redId,
      ownerVerified: true,
      searchText: "Legacy Name Riyadh",
    } as any);
    const access = { REDId: redId, role: "developer", authUserId: "admin-test" };

    const saved = await saveOwnedProjectDossierDraft(ctx, {
      propertyId,
      title: "Saudi Dossier Project",
      summary: "Dossier source of truth",
      projectType: "ready_property",
      salesMode: "developer_direct",
      requestedVisibility: "public",
      location: { countryCode: "SA", city: "Riyadh", district: "Al Malqa" },
    }, access);
    await saveOwnedProjectUnits(ctx, propertyId, [{
      label: "A1",
      unitKind: "unit_type",
      status: "available",
      bedrooms: 3,
      bathrooms: 3,
      sizeSqm: 140,
      price: 1_200_000,
    }], access);
    await saveOwnedProjectPaymentPlans(ctx, propertyId, [{
      title: "Cash",
      startingPrice: 1_200_000,
      status: "active",
    }], access);
    await saveOwnedProjectComplianceDocuments(ctx, propertyId, [{
      documentType: "ad_license",
      status: "submitted",
      title: "Ad license",
      files: [],
    }], access);

    const property = await ctx.db.get(propertyId);
    const detail = await getOwnedProjectDossierDetail(ctx, propertyId, access) as any;

    expect(saved.ok).toBe(true);
    expect(property.title).toBe("Saudi Dossier Project");
    expect(property.price).toBe(1_200_000);
    expect(detail.units).toHaveLength(1);
    expect(detail.readiness?.blockers.map((item: any) => item.code)).toContain("AD_LICENSE_REQUIRED");
    await expect(requestOwnedProjectPublication(ctx, propertyId, access)).rejects.toThrow();
  });
});

it("allows public readiness only when owner, ad license, units, payment plan, and authorization pass", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: "Ready Broker",
      slug: "ready-broker",
    } as any);
    const propertyId = await ctx.db.insert("properties", {
      title: "Ready Project",
      address: "Riyadh",
      location: "Riyadh",
      area: "Al Yasmin",
      description: "Ready property",
      price: 1_400_000,
      beds: 4,
      baths: 4,
      publicationState: "draft",
      ownerType: "broker",
      brokerId,
      ownerVerified: true,
      adLicenseStatus: "approved",
      searchText: "Ready Project Riyadh",
    } as any);

    const { dossierId } = await ensureProjectDossierForProperty(ctx, propertyId, {
      includeLegacyUnitAndPaymentPlan: true,
      requestedVisibility: "public",
    });
    await ctx.db.insert("projectBrokerAuthorizations", {
      dossierId,
      propertyId,
      brokerId,
      channels: ["website", "broker_network"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);

    const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
    const property = await ctx.db.get(propertyId);
    const dossier = await ctx.db.get(dossierId as any);
    const computed = await computeProjectReadiness(ctx, property as any, dossier as any);

    expect(readiness.status).toBe("published_ready");
    expect(computed.canPublish).toBe(true);
    expect(property?.projectReadinessStatus).toBe("published_ready");
  });
});

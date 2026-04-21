import { expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../../schema";
import { modules } from "../../test.setup";
import { ensureProjectDossierForProperty } from "./migrations";
import {
  applyOwnedProjectUnitBulkActions,
  getOwnedProjectDossierDetail,
  requestOwnedProjectPublication,
  saveOwnedProjectAdLicense,
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

it("accepts a verified GCC advertising permit as listing compliance evidence", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const redId = await ctx.db.insert("RED", {
      name: "Dubai Developer",
      slug: "dubai-developer",
    } as any);
    const propertyId = await ctx.db.insert("properties", {
      title: "Dubai Creek Project",
      address: "Dubai Creek",
      location: "Dubai",
      area: "Creek Harbour",
      description: "GCC ready property",
      price: 2_000_000,
      beds: 2,
      baths: 3,
      publicationState: "draft",
      ownerType: "RED",
      REDId: redId,
      ownerVerified: true,
      searchText: "Dubai Creek Project",
    } as any);
    const access = { REDId: redId, role: "developer", authUserId: "gcc-test" };

    await saveOwnedProjectDossierDraft(ctx, {
      propertyId,
      title: "Dubai Creek Project",
      summary: "GCC source of truth",
      projectType: "ready_property",
      salesMode: "developer_direct",
      requestedVisibility: "public",
      location: { countryCode: "AE", city: "Dubai", district: "Creek Harbour" },
    }, access);
    await saveOwnedProjectUnits(ctx, propertyId, [{
      label: "2BR-A",
      unitKind: "unit_type",
      status: "available",
      bedrooms: 2,
      bathrooms: 3,
      price: 2_000_000,
    }], access);
    await saveOwnedProjectPaymentPlans(ctx, propertyId, [{
      title: "Dubai launch plan",
      startingPrice: 2_000_000,
      status: "active",
    }], access);
    await saveOwnedProjectAdLicense(ctx, propertyId, {
      licenseNumber: "TRK-1234567890",
      countryCode: "AE",
      jurisdiction: "Dubai",
      permitType: "trakheesi",
      permitNumber: "TRK-1234567890",
      permitQrOrUrl: "https://dubailand.gov.ae/permits/TRK-1234567890",
      verificationStatus: "verified",
      sourceAuthority: "DLD_RERA",
      requiredForChannels: ["web", "mobile"],
      channels: ["web", "mobile"],
    }, access);

    const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
    const property = await ctx.db.get(propertyId);

    expect(readiness.status).toBe("published_ready");
    expect(readiness.completedRequirements).toContain("gcc_ad_permit_verified");
    expect(property?.listingVerified).toBe(true);
  });
});

it("applies owner-scoped bulk unit actions and recomputes readiness", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx: any) => {
    const redId = await ctx.db.insert("RED", {
      name: "Bulk Unit Developer",
      slug: "bulk-unit-developer",
    } as any);
    const propertyId = await ctx.db.insert("properties", {
      title: "Bulk Project",
      address: "Riyadh",
      location: "Riyadh",
      area: "Al Narjis",
      description: "Bulk unit project",
      price: 1_000_000,
      beds: 2,
      baths: 2,
      publicationState: "draft",
      ownerType: "RED",
      REDId: redId,
      ownerVerified: true,
      adLicenseStatus: "approved",
      searchText: "Bulk Project Riyadh",
    } as any);
    const access = { REDId: redId, role: "developer", authUserId: "bulk-test" };

    await saveOwnedProjectDossierDraft(ctx, {
      propertyId,
      title: "Bulk Project",
      projectType: "ready_property",
      salesMode: "developer_direct",
      requestedVisibility: "public",
      location: { countryCode: "SA", city: "Riyadh", district: "Al Narjis" },
    }, access);
    await saveOwnedProjectPaymentPlans(ctx, propertyId, [{
      title: "Cash",
      startingPrice: 1_000_000,
      status: "active",
    }], access);

    await applyOwnedProjectUnitBulkActions(ctx, propertyId, [
      { type: "create", unit: { label: "A1", unitKind: "unit", status: "draft", bedrooms: 2, bathrooms: 2, price: 1_000_000 } },
      { type: "import", units: [{ label: "B1", unitKind: "unit", status: "available", bedrooms: 3, bathrooms: 3, price: 1_300_000 }] },
    ], access);
    const detailAfterCreate = await getOwnedProjectDossierDetail(ctx, propertyId, access) as any;
    const draftUnit = detailAfterCreate.units.find((unit: any) => unit.label === "A1");
    const availableUnit = detailAfterCreate.units.find((unit: any) => unit.label === "B1");

    await applyOwnedProjectUnitBulkActions(ctx, propertyId, [
      { type: "mark_status", unitIds: [draftUnit._id], status: "available" },
      { type: "update", unitId: availableUnit._id, patch: { price: 1_250_000 } },
      { type: "duplicate", unitId: availableUnit._id, label: "B1 copy" },
      { type: "delete", unitId: draftUnit._id },
    ], access);

    const detail = await getOwnedProjectDossierDetail(ctx, propertyId, access) as any;
    expect(detail.units.map((unit: any) => unit.label).sort()).toEqual(["B1", "B1 copy"]);
    expect(detail.units.find((unit: any) => unit.label === "B1")?.price).toBe(1_250_000);
    expect(detail.readiness.status).toBe("published_ready");
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

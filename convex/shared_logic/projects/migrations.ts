import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import type { GenericId } from "convex/values";
import type { MutationCtx } from "../../_generated/server";
import { requireAdminAccess } from "../../_core/security/accessPolicy";
import {
  getProjectDossierByPropertyId,
  isPropertyDistributionReady,
  recomputeProjectReadinessForProperty,
} from "./readiness";
import { recordProjectReadinessEvent } from "./events";

type PropertyRecord = {
  _id: GenericId<"properties">;
  title: string;
  address: string;
  location?: string;
  area?: string;
  description: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  tenantOrgId?: string;
  ownerType?: "broker" | "RED";
  brokerId?: GenericId<"brokers">;
  REDId?: GenericId<"RED">;
  publicationState?: "draft" | "published" | "archived";
  body?: any;
  adLicenseNumber?: string;
  adLicenseStatus?: "pending" | "approved" | "rejected";
};

function resolveOwnerType(property: PropertyRecord): "broker" | "RED" {
  if (property.ownerType === "broker" || property.brokerId) return "broker";
  return "RED";
}

function resolveSalesMode(property: PropertyRecord): "developer_direct" | "broker_mediated" | "broker_owned" {
  if (property.brokerId) return "broker_owned";
  return "developer_direct";
}

function resolveLocation(property: PropertyRecord) {
  return {
    countryCode: "SA",
    city: property.location ?? property.address,
    district: property.area ?? property.address,
    confidence: "legacy" as const,
  };
}

function extractPrivatePermitFiles(property: PropertyRecord) {
  const files = property.body?.presentation?.privatePermitFiles;
  return Array.isArray(files) ? files : [];
}

async function maybeCreateDefaultUnitAndPaymentPlan(
  ctx: MutationCtx,
  dossierId: GenericId<"projectDossiers">,
  property: PropertyRecord,
  now: number,
) {
  const existingUnit = await ctx.db
    .query("projectUnits")
    .withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId))
    .first();
  if (!existingUnit) {
    await ctx.db.insert("projectUnits", {
      dossierId,
      propertyId: property._id,
      label: "Primary unit type",
      unitKind: "unit_type",
      status: property.publicationState === "archived" ? "draft" : "available",
      bedrooms: property.beds,
      bathrooms: property.baths,
      sizeSqm: property.sqft,
      price: property.price,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  const existingPaymentPlan = await ctx.db
    .query("projectPaymentPlans")
    .withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId))
    .first();
  if (!existingPaymentPlan) {
    await ctx.db.insert("projectPaymentPlans", {
      dossierId,
      propertyId: property._id,
      title: "Default cash price",
      cashPrice: property.price,
      startingPrice: property.price,
      milestones: [],
      status: "active",
      createdAt: now,
      updatedAt: now,
    } as any);
  }
}

async function maybeCreateLegacyDocuments(
  ctx: MutationCtx,
  dossierId: GenericId<"projectDossiers">,
  property: PropertyRecord,
  now: number,
) {
  const files = extractPrivatePermitFiles(property);
  if (files.length === 0 && !property.adLicenseNumber) return;

  const existingAdDocument = await ctx.db
    .query("projectComplianceDocuments")
    .withIndex("dossierId_documentType", (q: any) =>
      q.eq("dossierId", dossierId).eq("documentType", "ad_license"),
    )
    .first();
  if (!existingAdDocument && (files.length > 0 || property.adLicenseNumber)) {
    await ctx.db.insert("projectComplianceDocuments", {
      dossierId,
      propertyId: property._id,
      documentType: "ad_license",
      status: property.adLicenseStatus === "approved" ? "approved" : "submitted",
      title: "Migrated advertisement license evidence",
      licenseOrReferenceNumber: property.adLicenseNumber,
      files,
      createdAt: now,
      updatedAt: now,
    } as any);
  }

  const existingLicense = property.adLicenseNumber
    ? await ctx.db
        .query("projectAdLicenses")
        .withIndex("licenseNumber", (q: any) => q.eq("licenseNumber", property.adLicenseNumber!))
        .first()
    : null;
  if (!existingLicense && property.adLicenseNumber) {
    await ctx.db.insert("projectAdLicenses", {
      dossierId,
      propertyId: property._id,
      licenseNumber: property.adLicenseNumber,
      status: property.adLicenseStatus === "approved" ? "approved" : property.adLicenseStatus ?? "pending",
      channels: [],
      evidenceFiles: files,
      createdAt: now,
      updatedAt: now,
    } as any);
  }
}

/**
 * WHY:   Property creation now needs a Saudi project dossier source of truth beside the legacy projection row.
 * WHAT:  Creates or returns one dossier for a property, optionally adding default unit/payment rows from legacy fields.
 * HOW:   Uses the property owner linkage, stores strict requested visibility, and recomputes readiness immediately.
 */
export async function ensureProjectDossierForProperty(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  options: {
    includeLegacyUnitAndPaymentPlan?: boolean;
    forcePrivateUntilReady?: boolean;
    requestedVisibility?: "private" | "public";
    inventoryKind?: "project" | "standalone_unit";
  } = {},
) {
  const property = (await ctx.db.get(propertyId)) as PropertyRecord | null;
  if (!property) throw new Error("PROPERTY_NOT_FOUND");
  const existing = await getProjectDossierByPropertyId(ctx, propertyId);
  const now = Date.now();
  const requestedVisibility =
    options.requestedVisibility ??
    existing?.requestedVisibility ??
    (options.forcePrivateUntilReady
      ? "private"
      : property.publicationState === "published"
        ? "public"
        : "private");

  const dossierId =
    existing?._id ??
    await ctx.db.insert("projectDossiers", {
      propertyId,
      inventoryKind: options.inventoryKind ?? "project",
      tenantOrgId: property.tenantOrgId,
      ownerType: resolveOwnerType(property),
      ownerBrokerId: property.brokerId,
      ownerREDId: property.REDId,
      projectType: "ready_property",
      salesMode: resolveSalesMode(property),
      lifecycleStage: "rough_draft",
      requestedVisibility,
      readinessStatus: "incomplete",
      readinessBlockers: [],
      readinessWarnings: [],
      completedRequirements: [],
      location: resolveLocation(property),
      title: property.title,
      summary: property.description,
      legacyPublicationState: property.publicationState ?? "draft",
      migratedFromPropertyAt: now,
      createdAt: now,
      updatedAt: now,
    } as any);

  if (!existing) {
    await recordProjectReadinessEvent(ctx, {
      dossierId,
      propertyId,
      eventType: "dossier_created",
      message: "Project dossier created from property projection.",
      metadata: {
        legacyPublicationState: property.publicationState ?? "draft",
        requestedVisibility,
      },
    });
  }

  if (
    existing &&
    (existing.requestedVisibility !== requestedVisibility ||
      (options.inventoryKind && (existing as any).inventoryKind !== options.inventoryKind))
  ) {
    await ctx.db.patch(existing._id, {
      requestedVisibility,
      inventoryKind: options.inventoryKind ?? (existing as any).inventoryKind ?? "project",
      updatedAt: now,
    } as any);
  }

  if (options.includeLegacyUnitAndPaymentPlan) {
    await maybeCreateDefaultUnitAndPaymentPlan(ctx, dossierId, property, now);
  }
  await maybeCreateLegacyDocuments(ctx, dossierId, property, now);
  await ctx.db.patch(propertyId, { projectDossierId: dossierId } as any);
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  return { dossierId, readiness };
}

/**
 * WHY:   The Saudi market-fit rollout requires all legacy property rows to become dossier-backed immediately.
 * WHAT:  Backfills dossier records for existing properties and strips public distribution from incomplete rows.
 * HOW:   Processes a bounded batch idempotently and recomputes readiness for each property.
 */
export const hardMigratePropertiesToProjectDossiers = mutation({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit = 200 }) => {
    await requireAdminAccess(ctx);
    const properties = (await ctx.db.query("properties").take(limit)) as PropertyRecord[];
    let processed = 0;
    let created = 0;
    let blockedPublic = 0;

    for (const property of properties) {
      const existing = await getProjectDossierByPropertyId(ctx, property._id);
      const previousPublic =
        property.publicationState === "published" || (property as any).isPublicSearchable === true;
      const { readiness } = await ensureProjectDossierForProperty(ctx, property._id, {
        includeLegacyUnitAndPaymentPlan: false,
        forcePrivateUntilReady: true,
      });
      if (!existing) created += 1;
      if (previousPublic && readiness.status !== "published_ready") {
        await ctx.db.patch(property._id, {
          publicationState: "draft",
          isPublicSearchable: false,
          updatedAt: Date.now(),
        } as any);
        blockedPublic += 1;
      }
      processed += 1;
    }

    return { processed, created, blockedPublic };
  },
});

export const projectDossierMigrationPreflight = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    const [properties, brokers, developers, dossiers] = await Promise.all([
      ctx.db.query("properties").collect() as Promise<PropertyRecord[]>,
      ctx.db.query("brokers").collect(),
      ctx.db.query("RED").collect(),
      ctx.db.query("projectDossiers").collect(),
    ]);
    const dossierPropertyIds = new Set(dossiers.map((dossier: any) => String(dossier.propertyId)));
    const snapshot = {
      totalProperties: properties.length,
      publishedProperties: properties.filter((property) => property.publicationState === "published").length,
      publicSearchableProperties: properties.filter((property: any) => property.isPublicSearchable === true).length,
      approvedAdLicenseProperties: properties.filter((property) => property.adLicenseStatus === "approved").length,
      verifiedOwners: {
        brokers: brokers.filter((broker: any) => broker.isVerified === true).length,
        developers: developers.filter((developer: any) => developer.isVerified === true).length,
      },
      propertiesWithoutDossiers: properties.filter((property) => !dossierPropertyIds.has(String(property._id))).length,
    };
    await recordProjectReadinessEvent(ctx, {
      eventType: "migration_preflight",
      message: "Saudi project dossier migration preflight snapshot recorded.",
      metadata: snapshot,
    });
    return snapshot;
  },
});

export const projectDossierMigrationPostflight = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    const [properties, offers, offerPackages] = await Promise.all([
      ctx.db.query("properties").collect() as Promise<any[]>,
      ctx.db.query("offers").collect() as Promise<any[]>,
      ctx.db.query("offerPackages").collect() as Promise<any[]>,
    ]);
    const failures: Array<{ code: string; propertyId?: string; offerId?: string; offerPackageId?: string }> = [];
    for (const property of properties) {
      if (!property.projectDossierId) failures.push({ code: "PROPERTY_MISSING_DOSSIER", propertyId: String(property._id) });
      if (property.isPublicSearchable === true && !isPropertyDistributionReady(property)) {
        failures.push({ code: "PUBLIC_PROPERTY_NOT_READY", propertyId: String(property._id) });
      }
      if (
        property.publicationState === "published" &&
        (property.ownerVerified !== true || property.adLicenseStatus !== "approved")
      ) {
        failures.push({ code: "PUBLISHED_PROPERTY_MISSING_VERIFICATION", propertyId: String(property._id) });
      }
    }
    for (const offer of offers) {
      if (offer.visibility !== "public") continue;
      const property = properties.find((item) => String(item._id) === String(offer.propertyId));
      if (!property || !isPropertyDistributionReady(property)) {
        failures.push({ code: "PUBLIC_OFFER_POINTS_TO_BLOCKED_PROJECT", offerId: String(offer._id), propertyId: String(offer.propertyId) });
      }
    }
    for (const offerPackage of offerPackages) {
      if (offerPackage.visibility !== "open" || !offerPackage.propertyId) continue;
      const property = properties.find((item) => String(item._id) === String(offerPackage.propertyId));
      if (!property || !isPropertyDistributionReady(property)) {
        failures.push({ code: "OPEN_OFFER_PACKAGE_POINTS_TO_BLOCKED_PROJECT", offerPackageId: String(offerPackage._id), propertyId: String(offerPackage.propertyId) });
      }
    }
    const result = { ok: failures.length === 0, failures };
    await recordProjectReadinessEvent(ctx, {
      eventType: "migration_postflight",
      message: result.ok ? "Saudi project dossier migration postflight passed." : "Saudi project dossier migration postflight failed.",
      metadata: result,
    });
    return result;
  },
});

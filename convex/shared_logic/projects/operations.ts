import { ConvexError } from "convex/values";
import type { GenericId } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { buildPropertySearchText } from "../properties/searchText";
import { recordProjectReadinessEvent } from "./events";
import { ensureProjectDossierForProperty } from "./migrations";
import {
  getProjectDossierByPropertyId,
  recomputeProjectReadinessForProperty,
  type ProjectReadinessResult,
} from "./readiness";

type OwnerAccess = {
  authUserId?: string;
  role?: string;
  brokerId?: GenericId<"brokers">;
  REDId?: GenericId<"RED">;
};

type DossierRecord = {
  _id: GenericId<"projectDossiers">;
  propertyId: GenericId<"properties">;
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  title: string;
  summary?: string;
  requestedVisibility: "private" | "public";
  readinessStatus?: string;
  location: {
    countryCode: string;
    city?: string;
    district?: string;
    neighborhood?: string;
    street?: string;
    nationalAddress?: string;
    latitude?: number;
    longitude?: number;
    confidence?: "manual" | "verified" | "legacy";
  };
};

type ProjectUnitPatch = Partial<{
  label: string;
  unitKind: "unit_type" | "unit";
  status: "available" | "reserved" | "sold" | "draft";
  bedrooms: number;
  bathrooms: number;
  sizeSqm: number;
  floor: string;
  view: string;
  price: number;
  handoverAt: number;
  floorPlanMedia: unknown[];
}>;

type ProjectUnitBulkAction =
  | { type: "create"; unit: any }
  | { type: "update"; unitId: GenericId<"projectUnits">; patch: ProjectUnitPatch }
  | { type: "delete"; unitId: GenericId<"projectUnits"> }
  | { type: "duplicate"; unitId: GenericId<"projectUnits">; label?: string }
  | { type: "mark_status"; unitIds: GenericId<"projectUnits">[]; status: "available" | "reserved" | "sold" | "draft" }
  | { type: "import"; units: any[] };

function assertOwner(property: any, access: OwnerAccess) {
  if (access.brokerId && property.brokerId === access.brokerId) return;
  if (access.REDId && property.REDId === access.REDId) return;
  throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access another owner project" });
}

function normalizeLocation(input: any, fallback?: DossierRecord["location"]) {
  return {
    countryCode: input?.countryCode ?? fallback?.countryCode ?? "SA",
    city: input?.city ?? fallback?.city,
    district: input?.district ?? fallback?.district,
    neighborhood: input?.neighborhood ?? fallback?.neighborhood,
    street: input?.street ?? fallback?.street,
    nationalAddress: input?.nationalAddress ?? fallback?.nationalAddress,
    latitude: input?.latitude ?? fallback?.latitude,
    longitude: input?.longitude ?? fallback?.longitude,
    confidence: "manual" as const,
  };
}

async function requireOwnedDossier(
  ctx: QueryCtx | MutationCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const property = await ctx.db.get(propertyId);
  if (!property) throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  assertOwner(property, access);
  return { property, dossier: await getProjectDossierByPropertyId(ctx, propertyId) };
}

async function collectDossierChildren(ctx: QueryCtx | MutationCtx, dossierId: GenericId<"projectDossiers">) {
  const [units, paymentPlans, documents, adLicenses, brokerAuthorizations, events] = await Promise.all([
    ctx.db.query("projectUnits").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect(),
    ctx.db.query("projectPaymentPlans").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect(),
    ctx.db.query("projectComplianceDocuments").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect(),
    ctx.db.query("projectAdLicenses").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect(),
    ctx.db.query("projectBrokerAuthorizations").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect(),
    ctx.db.query("projectReadinessEvents").withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).order("desc").take(25),
  ]);
  return { units, paymentPlans, documents, adLicenses, brokerAuthorizations, events };
}

/**
 * WHY:   Workspace screens need one dossier read model instead of assembling project tables in page code.
 * WHAT:  Loads the dossier, child rows, linked property projection, and recomputed readiness.
 * HOW:   Enforces owner access through the legacy property row and returns a single server contract shape.
 */
export async function getOwnedProjectDossierDetail(
  ctx: QueryCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const { property, dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) return { property, dossier: null, readiness: null };
  return {
    property,
    dossier,
    ...(await collectDossierChildren(ctx, dossier._id)),
    readiness: {
      status: (dossier as any).readinessStatus,
      canPublish: (dossier as any).readinessStatus === "published_ready",
      canDistributeToAi: (dossier as any).readinessStatus === "published_ready",
      canCreateOpenOffer: (dossier as any).readinessStatus === "published_ready",
      blockers: (dossier as any).readinessBlockers ?? [],
      warnings: (dossier as any).readinessWarnings ?? [],
      completedRequirements: (dossier as any).completedRequirements ?? [],
    } satisfies ProjectReadinessResult,
  };
}

async function replaceRows(
  ctx: MutationCtx,
  table: "projectUnits" | "projectPaymentPlans" | "projectComplianceDocuments" | "projectAdLicenses" | "projectBrokerAuthorizations",
  dossierId: GenericId<"projectDossiers">,
  rows: any[],
  buildRow: (row: any) => any,
) {
  const existing = await ctx.db.query(table).withIndex("dossierId", (q: any) => q.eq("dossierId", dossierId)).collect();
  for (const row of existing) await ctx.db.delete(row._id);
  const now = Date.now();
  for (const row of rows) {
    await ctx.db.insert(table, { ...buildRow(row), createdAt: now, updatedAt: now } as any);
  }
}

async function regeneratePropertyProjection(ctx: MutationCtx, propertyId: GenericId<"properties">) {
  const property = await ctx.db.get(propertyId) as any;
  const dossier = await getProjectDossierByPropertyId(ctx, propertyId) as DossierRecord | null;
  if (!dossier) return;
  const detail = await collectDossierChildren(ctx, dossier._id);
  const firstAvailableUnit = detail.units.find((unit: any) => unit.status === "available") ?? detail.units[0];
  const firstPaymentPlan = detail.paymentPlans.find((plan: any) => plan.status === "active") ?? detail.paymentPlans[0];
  const price = firstPaymentPlan?.startingPrice ?? firstPaymentPlan?.cashPrice ?? firstAvailableUnit?.price;
  const cityDistrict = [dossier.location.city, dossier.location.district].filter(Boolean).join(", ");
  const patch: any = {
    title: dossier.title,
    description: dossier.summary ?? property.description,
    location: dossier.location.city ?? property.location,
    area: dossier.location.district ?? property.area,
    address: cityDistrict || property.address,
    publicationState: "draft",
    updatedAt: Date.now(),
  };
  if (typeof price === "number") patch.price = price;
  if (typeof firstAvailableUnit?.bedrooms === "number") patch.beds = firstAvailableUnit.bedrooms;
  if (typeof firstAvailableUnit?.bathrooms === "number") patch.baths = firstAvailableUnit.bathrooms;
  if (typeof firstAvailableUnit?.sizeSqm === "number") patch.sqft = firstAvailableUnit.sizeSqm;
  patch.searchText = buildPropertySearchText({ ...property, ...patch });
  await ctx.db.patch(propertyId, patch);
}

async function requireOwnedUnit(
  ctx: MutationCtx,
  dossierId: GenericId<"projectDossiers">,
  unitId: GenericId<"projectUnits">,
) {
  const unit = await ctx.db.get(unitId);
  if (!unit || (unit as any).dossierId !== dossierId) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Project unit not found for this dossier" });
  }
  return unit as any;
}

function normalizeUnitPatch(patch: ProjectUnitPatch) {
  const next: any = { ...patch };
  delete next.dossierId;
  delete next.propertyId;
  delete next.createdAt;
  delete next.updatedAt;
  return next;
}

/**
 * WHY:   Dossier draft saves must update project truth first and keep the search projection synchronized.
 * WHAT:  Patches the dossier identity/location/visibility and mirrors safe legacy fields to `properties`.
 * HOW:   Ensures a dossier exists, applies draft fields, regenerates projection, then recomputes readiness.
 */
export async function saveOwnedProjectDossierDraft(
  ctx: MutationCtx,
  input: any,
  access: OwnerAccess,
) {
  const { property } = await requireOwnedDossier(ctx, input.propertyId, access);
  const ensured = await ensureProjectDossierForProperty(ctx, input.propertyId, {
    forcePrivateUntilReady: true,
    requestedVisibility: input.requestedVisibility,
  });
  const dossier = (await ctx.db.get(ensured.dossierId)) as DossierRecord;
  const now = Date.now();
  await ctx.db.patch(dossier._id, {
    projectType: input.projectType ?? (dossier as any).projectType,
    salesMode: input.salesMode ?? (dossier as any).salesMode,
    requestedVisibility: input.requestedVisibility ?? dossier.requestedVisibility,
    lifecycleStage: input.lifecycleStage ?? (dossier as any).lifecycleStage ?? "draft",
    title: input.title ?? dossier.title,
    summary: input.summary ?? dossier.summary,
    location: input.location ? normalizeLocation(input.location, dossier.location) : dossier.location,
    updatedAt: now,
  } as any);
  await regeneratePropertyProjection(ctx, input.propertyId);
  const readiness = await recomputeProjectReadinessForProperty(ctx, input.propertyId);
  await recordProjectReadinessEvent(ctx, {
    dossierId: dossier._id,
    propertyId: input.propertyId,
    actorAuthUserId: access.authUserId,
    actorRole: access.role,
    eventType: "dossier_saved",
    nextStatus: readiness.status,
    message: "Project dossier draft saved.",
    metadata: { requestedVisibility: input.requestedVisibility, ownerType: property.ownerType },
  });
  return { ok: true as const, propertyId: input.propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectUnits(ctx: MutationCtx, propertyId: GenericId<"properties">, units: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectUnits", dossier._id, units, (unit) => ({ ...unit, dossierId: dossier._id, propertyId }));
  await regeneratePropertyProjection(ctx, propertyId);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness: await recomputeProjectReadinessForProperty(ctx, propertyId) };
}

/**
 * WHY:   Workspace unit inventory needs granular bulk actions without replacing the entire dossier inventory each time.
 * WHAT:  Applies create, update, delete, duplicate, import, and status-mark actions to owner-scoped project units.
 * HOW:   Enforces ownership through the parent property/dossier, verifies every unit belongs to that dossier, then recomputes readiness.
 */
export async function applyOwnedProjectUnitBulkActions(
  ctx: MutationCtx,
  propertyId: GenericId<"properties">,
  actions: ProjectUnitBulkAction[],
  access: OwnerAccess,
) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  const now = Date.now();

  for (const action of actions) {
    if (action.type === "create") {
      await ctx.db.insert("projectUnits", {
        ...action.unit,
        dossierId: dossier._id,
        propertyId,
        createdAt: now,
        updatedAt: now,
      } as any);
      continue;
    }

    if (action.type === "import") {
      for (const unit of action.units) {
        await ctx.db.insert("projectUnits", {
          ...unit,
          dossierId: dossier._id,
          propertyId,
          createdAt: now,
          updatedAt: now,
        } as any);
      }
      continue;
    }

    if (action.type === "update") {
      await requireOwnedUnit(ctx, dossier._id, action.unitId);
      await ctx.db.patch(action.unitId, { ...normalizeUnitPatch(action.patch), updatedAt: now } as any);
      continue;
    }

    if (action.type === "delete") {
      await requireOwnedUnit(ctx, dossier._id, action.unitId);
      await ctx.db.delete(action.unitId);
      continue;
    }

    if (action.type === "duplicate") {
      const source = await requireOwnedUnit(ctx, dossier._id, action.unitId);
      const { _id, _creationTime, createdAt, updatedAt, ...copy } = source;
      await ctx.db.insert("projectUnits", {
        ...copy,
        label: action.label?.trim() || `${source.label} copy`,
        status: source.status === "sold" ? "draft" : source.status,
        createdAt: now,
        updatedAt: now,
      } as any);
      continue;
    }

    for (const unitId of action.unitIds) {
      await requireOwnedUnit(ctx, dossier._id, unitId);
      await ctx.db.patch(unitId, { status: action.status, updatedAt: now } as any);
    }
  }

  await regeneratePropertyProjection(ctx, propertyId);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness: await recomputeProjectReadinessForProperty(ctx, propertyId) };
}

export async function saveOwnedProjectPaymentPlans(ctx: MutationCtx, propertyId: GenericId<"properties">, paymentPlans: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectPaymentPlans", dossier._id, paymentPlans, (plan) => ({ ...plan, milestones: plan.milestones ?? [], dossierId: dossier._id, propertyId }));
  await regeneratePropertyProjection(ctx, propertyId);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness: await recomputeProjectReadinessForProperty(ctx, propertyId) };
}

export async function saveOwnedProjectComplianceDocuments(ctx: MutationCtx, propertyId: GenericId<"properties">, documents: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectComplianceDocuments", dossier._id, documents, (document) => ({ ...document, status: document.status ?? "submitted", dossierId: dossier._id, propertyId }));
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "document_reviewed", nextStatus: readiness.status, message: "Project compliance documents saved." });
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectAdLicense(ctx: MutationCtx, propertyId: GenericId<"properties">, adLicense: any, access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectAdLicenses", dossier._id, adLicense ? [adLicense] : [], (license) => ({
    ...license,
    countryCode: license.countryCode ?? dossier.location?.countryCode,
    jurisdiction: license.jurisdiction ?? dossier.location?.city,
    permitNumber: license.permitNumber ?? license.licenseNumber,
    requiredForChannels: license.requiredForChannels ?? license.channels ?? [],
    channels: license.channels ?? license.requiredForChannels ?? [],
    verificationStatus:
      license.verificationStatus ??
      (license.status === "approved" ? "verified" : license.status === "expired" ? "expired" : license.status === "rejected" ? "rejected" : "submitted"),
    status: license.status ?? (license.verificationStatus === "verified" ? "approved" : "pending"),
    dossierId: dossier._id,
    propertyId,
  }));
  await ctx.db.patch(propertyId, {
    adLicenseNumber: adLicense?.licenseNumber,
    adLicenseStatus:
      adLicense?.status ??
      (adLicense?.verificationStatus === "verified" ? "approved" : adLicense ? "pending" : undefined),
    updatedAt: Date.now(),
  } as any);
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "ad_license_reviewed", nextStatus: readiness.status, message: "Project ad license saved." });
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectBrokerAuthorization(ctx: MutationCtx, propertyId: GenericId<"properties">, authorization: any, access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectBrokerAuthorizations", dossier._id, authorization ? [authorization] : [], (row) => ({ ...row, channels: row.channels ?? [], status: row.status ?? "draft", dossierId: dossier._id, propertyId }));
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness: await recomputeProjectReadinessForProperty(ctx, propertyId) };
}

export async function requestOwnedProjectPublication(ctx: MutationCtx, propertyId: GenericId<"properties">, access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await ctx.db.patch(dossier._id, { requestedVisibility: "public", updatedAt: Date.now() } as any);
  await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "publish_requested", message: "Public distribution was requested." });
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  if (!readiness.canPublish) {
    await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "publish_blocked", nextStatus: readiness.status, message: readiness.blockers[0]?.label ?? "Project readiness required.", metadata: { blockers: readiness.blockers } });
    throw new ConvexError({ code: "PROJECT_READINESS_REQUIRED", message: readiness.blockers[0]?.label ?? "Project readiness approval is required before publishing", details: readiness.blockers });
  }
  await ctx.db.patch(propertyId, { publicationState: "published", isPublicSearchable: true, projectReadinessStatus: readiness.status, updatedAt: Date.now() } as any);
  await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "publish_approved", nextStatus: readiness.status, message: "Project is approved for public distribution." });
  return { ok: true as const, publicationState: "published" as const, readiness };
}

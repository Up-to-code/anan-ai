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
import {
  enqueueProjectUnitArchiveForZaneAi,
  enqueueProjectUnitsForZaneAi,
  enqueueProjectUpsertForZaneAi,
} from "../integrations/zaneAiWebhook";

type OwnerAccess = {
  authUserId?: string;
  role?: string;
  brokerId?: GenericId<"brokers">;
  REDId?: GenericId<"RED">;
};

type DossierRecord = {
  _id: GenericId<"projectDossiers">;
  propertyId: GenericId<"properties">;
  inventoryKind?: "project" | "standalone_unit";
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  title: string;
  summary?: string;
  targetAudience?: string;
  expectedUnitCountLabel?: string;
  unitTypeMix?: string[];
  primaryUnitType?: string;
  averagePrice?: number;
  options?: string[];
  services?: string[];
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
  location: DossierRecord["location"];
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

function activeRows<T extends { deletedAt?: number }>(rows: T[]) {
  return rows.filter((row) => typeof row.deletedAt !== "number");
}

async function requireOwnedDossier(
  ctx: QueryCtx | MutationCtx,
  propertyId: GenericId<"properties">,
  access: OwnerAccess,
) {
  const property = await ctx.db.get(propertyId);
  if (!property || typeof (property as any).deletedAt === "number") {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
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
  return {
    units: activeRows(units as any[]),
    paymentPlans: activeRows(paymentPlans as any[]),
    documents: activeRows(documents as any[]),
    adLicenses: activeRows(adLicenses as any[]),
    brokerAuthorizations: activeRows(brokerAuthorizations as any[]),
    events,
  };
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

/**
 * WHY:   Project routes now use the dossier id as the canonical project id while old property urls still need resolution.
 * WHAT:  Loads an owner-scoped dossier detail by project/dossier id.
 * HOW:   Reads the dossier first, then reuses the same property ownership gate and child-row collection as property-id reads.
 */
export async function getOwnedProjectDossierDetailByProjectId(
  ctx: QueryCtx,
  projectId: GenericId<"projectDossiers">,
  access: OwnerAccess,
) {
  const dossier = (await ctx.db.get(projectId)) as DossierRecord | null;
  if (!dossier || typeof (dossier as any).deletedAt === "number") {
    throw new ConvexError({ code: "NOT_FOUND", message: "Project not found" });
  }
  const { property } = await requireOwnedDossier(ctx, dossier.propertyId, access);
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

export async function getOwnedProjectWorkspaceDetail(
  ctx: QueryCtx,
  routeProjectId: string,
  access: OwnerAccess,
) {
  const dossierId = ctx.db.normalizeId("projectDossiers", routeProjectId);
  if (dossierId) {
    return getOwnedProjectDossierDetailByProjectId(ctx, dossierId, access);
  }

  const propertyId = ctx.db.normalizeId("properties", routeProjectId);
  if (propertyId) {
    return getOwnedProjectDossierDetail(ctx, propertyId, access);
  }

  throw new ConvexError({ code: "NOT_FOUND", message: "Project not found" });
}

async function listOwnedProperties(ctx: QueryCtx, access: OwnerAccess) {
  if (access.brokerId) {
    return ctx.db
      .query("properties")
      .withIndex("brokerId", (q: any) => q.eq("brokerId", access.brokerId!))
      .order("desc")
      .take(100);
  }
  if (access.REDId) {
    return ctx.db
      .query("properties")
      .withIndex("REDId", (q: any) => q.eq("REDId", access.REDId!))
      .order("desc")
      .take(100);
  }
  throw new ConvexError({ code: "FORBIDDEN", message: "Missing project owner context" });
}

/**
 * WHY:   The projects workspace should subscribe to one read model instead of route code assembling many reads.
 * WHAT:  Returns owner properties with their dossier details in one serializable payload.
 * HOW:   Uses the same ownership gate as detail reads and keeps zone wrappers tiny.
 */
export async function getOwnedProjectsWorkspace(ctx: QueryCtx, access: OwnerAccess) {
  const properties = (await listOwnedProperties(ctx, access)).filter(
    (property: any) => typeof property.deletedAt !== "number",
  );
  const details = await Promise.all(
    properties.map((property: any) =>
      getOwnedProjectDossierDetail(ctx, property._id, access).catch(() => ({
        property,
        dossier: null,
        readiness: null,
      })),
    ),
  );

  return {
    page: details,
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
  if (!unit || (unit as any).dossierId !== dossierId || typeof (unit as any).deletedAt === "number") {
    throw new ConvexError({ code: "NOT_FOUND", message: "Project unit not found for this dossier" });
  }
  return unit as any;
}

function normalizeUnitPatch(patch: ProjectUnitPatch) {
  const next: any = { ...patch };
  if (next.location) {
    next.location = normalizeLocation(next.location);
  }
  delete next.dossierId;
  delete next.propertyId;
  delete next.createdAt;
  delete next.updatedAt;
  return next;
}

function normalizeStringList(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => String(item).trim()).filter(Boolean)
    : undefined;
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
    inventoryKind: input.inventoryKind,
  });
  const dossier = (await ctx.db.get(ensured.dossierId)) as DossierRecord;
  const now = Date.now();
  await ctx.db.patch(dossier._id, {
    inventoryKind: input.inventoryKind ?? dossier.inventoryKind ?? "project",
    projectType: input.projectType ?? (dossier as any).projectType,
    salesMode: input.salesMode ?? (dossier as any).salesMode,
    requestedVisibility: input.requestedVisibility ?? dossier.requestedVisibility,
    lifecycleStage: input.lifecycleStage ?? (dossier as any).lifecycleStage ?? "draft",
    title: input.title ?? dossier.title,
    summary: input.summary ?? dossier.summary,
    targetAudience: input.targetAudience?.trim() || dossier.targetAudience,
    expectedUnitCountLabel: input.expectedUnitCountLabel?.trim() || dossier.expectedUnitCountLabel,
    unitTypeMix: normalizeStringList(input.unitTypeMix) ?? dossier.unitTypeMix,
    primaryUnitType: input.primaryUnitType?.trim() || dossier.primaryUnitType,
    averagePrice: typeof input.averagePrice === "number" ? input.averagePrice : dossier.averagePrice,
    options: normalizeStringList(input.options) ?? dossier.options,
    services: normalizeStringList(input.services) ?? dossier.services,
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
  await enqueueProjectUpsertForZaneAi(ctx, input.propertyId, access);
  return { ok: true as const, propertyId: input.propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectUnits(ctx: MutationCtx, propertyId: GenericId<"properties">, units: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  const existing = await ctx.db.query("projectUnits").withIndex("propertyId", (q: any) => q.eq("propertyId", propertyId)).collect();
  for (const unit of existing) {
    await enqueueProjectUnitArchiveForZaneAi(ctx, propertyId, unit, access);
  }
  await replaceRows(ctx, "projectUnits", dossier._id, units, (unit) => ({ ...unit, dossierId: dossier._id, propertyId }));
  await regeneratePropertyProjection(ctx, propertyId);
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  await enqueueProjectUnitsForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
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
  const createdUnitIds: GenericId<"projectUnits">[] = [];

  for (const action of actions) {
    if (action.type === "create") {
      const unitId = await ctx.db.insert("projectUnits", {
        ...action.unit,
        dossierId: dossier._id,
        propertyId,
        createdAt: now,
        updatedAt: now,
      } as any);
      createdUnitIds.push(unitId);
      continue;
    }

    if (action.type === "import") {
      for (const unit of action.units) {
        const unitId = await ctx.db.insert("projectUnits", {
          ...unit,
          dossierId: dossier._id,
          propertyId,
          createdAt: now,
          updatedAt: now,
        } as any);
        createdUnitIds.push(unitId);
      }
      continue;
    }

    if (action.type === "update") {
      await requireOwnedUnit(ctx, dossier._id, action.unitId);
      await ctx.db.patch(action.unitId, { ...normalizeUnitPatch(action.patch), updatedAt: now } as any);
      continue;
    }

    if (action.type === "delete") {
      const unit = await requireOwnedUnit(ctx, dossier._id, action.unitId);
      await enqueueProjectUnitArchiveForZaneAi(ctx, propertyId, unit, access);
      await ctx.db.patch(action.unitId, { deletedAt: now, status: "draft", updatedAt: now } as any);
      continue;
    }

    if (action.type === "duplicate") {
      const source = await requireOwnedUnit(ctx, dossier._id, action.unitId);
      const { _id, _creationTime, createdAt, updatedAt, ...copy } = source;
      const unitId = await ctx.db.insert("projectUnits", {
        ...copy,
        label: action.label?.trim() || `${source.label} copy`,
        status: source.status === "sold" ? "draft" : source.status,
        createdAt: now,
        updatedAt: now,
      } as any);
      createdUnitIds.push(unitId);
      continue;
    }

    for (const unitId of action.unitIds) {
      await requireOwnedUnit(ctx, dossier._id, unitId);
      await ctx.db.patch(unitId, { status: action.status, updatedAt: now } as any);
    }
  }

  await regeneratePropertyProjection(ctx, propertyId);
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  await enqueueProjectUnitsForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness, createdUnitIds };
}

export async function saveOwnedProjectPaymentPlans(ctx: MutationCtx, propertyId: GenericId<"properties">, paymentPlans: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectPaymentPlans", dossier._id, paymentPlans, (plan) => ({ ...plan, milestones: plan.milestones ?? [], dossierId: dossier._id, propertyId }));
  await regeneratePropertyProjection(ctx, propertyId);
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectComplianceDocuments(ctx: MutationCtx, propertyId: GenericId<"properties">, documents: any[], access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectComplianceDocuments", dossier._id, documents, (document) => ({ ...document, status: document.status ?? "submitted", dossierId: dossier._id, propertyId }));
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await recordProjectReadinessEvent(ctx, { dossierId: dossier._id, propertyId, actorAuthUserId: access.authUserId, actorRole: access.role, eventType: "document_reviewed", nextStatus: readiness.status, message: "Project compliance documents saved." });
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
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
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
}

export async function saveOwnedProjectBrokerAuthorization(ctx: MutationCtx, propertyId: GenericId<"properties">, authorization: any, access: OwnerAccess) {
  const { dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  await replaceRows(ctx, "projectBrokerAuthorizations", dossier._id, authorization ? [authorization] : [], (row) => ({ ...row, channels: row.channels ?? [], status: row.status ?? "draft", dossierId: dossier._id, propertyId }));
  const readiness = await recomputeProjectReadinessForProperty(ctx, propertyId);
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id, readiness };
}

/**
 * WHY:   Project-zone deletion must archive dossier children instead of hard-deleting only the property projection.
 * WHAT:  Marks the project, dossier, units, payment plans, documents, licenses, and authorizations as inactive.
 * HOW:   Enforces owner access through the parent property, soft-deletes child rows, then syncs downstream inventory.
 */
export async function archiveOwnedProject(ctx: MutationCtx, propertyId: GenericId<"properties">, access: OwnerAccess) {
  const { property, dossier } = await requireOwnedDossier(ctx, propertyId, access);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  const now = Date.now();
  const detail = await collectDossierChildren(ctx, dossier._id);

  for (const unit of detail.units) {
    await enqueueProjectUnitArchiveForZaneAi(ctx, propertyId, unit, access);
    await ctx.db.patch(unit._id, { deletedAt: now, status: "draft", updatedAt: now } as any);
  }
  for (const plan of detail.paymentPlans) {
    await ctx.db.patch(plan._id, { deletedAt: now, status: "archived", updatedAt: now } as any);
  }
  for (const document of detail.documents) {
    await ctx.db.patch(document._id, { deletedAt: now, updatedAt: now } as any);
  }
  for (const license of detail.adLicenses) {
    await ctx.db.patch(license._id, { deletedAt: now, status: "expired", updatedAt: now } as any);
  }
  for (const authorization of detail.brokerAuthorizations) {
    await ctx.db.patch(authorization._id, { deletedAt: now, status: "revoked", updatedAt: now } as any);
  }

  await ctx.db.patch(dossier._id, {
    deletedAt: now,
    lifecycleStage: "archived",
    status: "archived",
    requestedVisibility: "private",
    updatedAt: now,
  } as any);
  await ctx.db.patch(propertyId, {
    deletedAt: now,
    publicationState: "archived",
    isPublished: false,
    isPublicSearchable: false,
    projectReadinessStatus: "blocked",
    updatedAt: now,
  } as any);
  await recordProjectReadinessEvent(ctx, {
    dossierId: dossier._id,
    propertyId,
    actorAuthUserId: access.authUserId,
    actorRole: access.role,
    eventType: "dossier_saved",
    nextStatus: "blocked",
    message: "Project archived from workspace.",
    metadata: { ownerType: property.ownerType, inventoryKind: (dossier as any).inventoryKind ?? "project" },
  });
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  return { ok: true as const, propertyId, dossierId: dossier._id };
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
  await enqueueProjectUpsertForZaneAi(ctx, propertyId, access);
  await enqueueProjectUnitsForZaneAi(ctx, propertyId, access);
  return { ok: true as const, publicationState: "published" as const, readiness };
}

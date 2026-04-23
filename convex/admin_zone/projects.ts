import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";
import { recordProjectReadinessEvent } from "../shared_logic/projects/events";
import {
  recomputeProjectReadinessForProperty,
  type ProjectReadinessStatus,
} from "../shared_logic/projects/readiness";

const readinessQueueFilterValidator = v.union(
  v.literal("incomplete"),
  v.literal("pending_review"),
  v.literal("approved"),
  v.literal("blocked"),
  v.literal("expired"),
);

function mapQueueFilter(filter: string): ProjectReadinessStatus[] {
  if (filter === "approved") return ["approved", "published_ready"];
  if (filter === "pending_review") return ["data_complete", "compliance_pending"];
  if (filter === "expired") return ["blocked"];
  return [filter as ProjectReadinessStatus];
}

async function loadProjectDetail(ctx: any, dossier: any) {
  const [property, units, paymentPlans, documents, adLicenses, brokerAuthorizations] = await Promise.all([
    ctx.db.get(dossier.propertyId),
    ctx.db.query("projectUnits").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
    ctx.db.query("projectPaymentPlans").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
    ctx.db.query("projectComplianceDocuments").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
    ctx.db.query("projectAdLicenses").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
    ctx.db.query("projectBrokerAuthorizations").withIndex("dossierId", (q: any) => q.eq("dossierId", dossier._id)).collect(),
  ]);
  return {
    dossier,
    property,
    units,
    paymentPlans,
    documents,
    adLicenses,
    brokerAuthorizations,
    readiness: {
      status: dossier.readinessStatus,
      canPublish: dossier.readinessStatus === "published_ready",
      canDistributeToAi: dossier.readinessStatus === "published_ready",
      canCreateOpenOffer: dossier.readinessStatus === "published_ready",
      blockers: dossier.readinessBlockers ?? [],
      warnings: dossier.readinessWarnings ?? [],
      completedRequirements: dossier.completedRequirements ?? [],
    },
  };
}

/**
 * WHY:   Admin operations need a Saudi readiness queue separate from generic verification status.
 * WHAT:  Lists dossiers grouped by readiness state for incomplete, pending, approved, blocked, and renewal work.
 * HOW:   Reads recent dossiers, applies queue mapping, then joins the linked projection row for review context.
 */
export const listProjectReadinessQueue = query({
  args: { filter: readinessQueueFilterValidator, limit: v.optional(v.number()) },
  handler: async (ctx, { filter, limit = 100 }) => {
    await requireAdminAccess(ctx);
    const statuses = mapQueueFilter(filter);
    const rows = await ctx.db.query("projectDossiers").order("desc").take(Math.max(limit * 3, limit));
    const filtered = rows
      .filter((dossier: any) => statuses.includes(dossier.readinessStatus))
      .slice(0, limit);
    return Promise.all(filtered.map(loadProjectDetail.bind(null, ctx)));
  },
});

export const getProjectReviewDetail = query({
  args: { dossierId: v.id("projectDossiers") },
  handler: async (ctx, { dossierId }) => {
    await requireAdminAccess(ctx);
    const dossier = await ctx.db.get(dossierId);
    if (!dossier) return null;
    return loadProjectDetail(ctx, dossier);
  },
});

async function requireDossier(ctx: any, dossierId: any) {
  const dossier = await ctx.db.get(dossierId);
  if (!dossier) throw new ConvexError({ code: "NOT_FOUND", message: "Project dossier not found" });
  return dossier;
}

async function recomputeAndLog(ctx: any, dossier: any, eventType: "document_reviewed" | "ad_license_reviewed" | "admin_blocked" | "admin_unblocked", message: string, metadata?: unknown) {
  const readiness = await recomputeProjectReadinessForProperty(ctx, dossier.propertyId);
  await recordProjectReadinessEvent(ctx, {
    dossierId: dossier._id,
    propertyId: dossier.propertyId,
    eventType,
    nextStatus: readiness.status,
    message,
    metadata,
  });
  return readiness;
}

export const reviewProjectDocument = mutation({
  args: {
    documentId: v.id("projectComplianceDocuments"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("in_review"), v.literal("expired")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { documentId, status, notes }) => {
    await requireAdminAccess(ctx);
    const document = await ctx.db.get(documentId);
    if (!document) throw new ConvexError({ code: "NOT_FOUND", message: "Project document not found" });
    await ctx.db.patch(documentId, { status, notes, updatedAt: Date.now() } as any);
    const dossier = await requireDossier(ctx, document.dossierId);
    return { ok: true, readiness: await recomputeAndLog(ctx, dossier, "document_reviewed", `Project document ${status}.`, { documentId, status }) };
  },
});

export const reviewProjectAdLicense = mutation({
  args: {
    adLicenseId: v.id("projectAdLicenses"),
    status: v.union(v.literal("approved"), v.literal("rejected"), v.literal("pending"), v.literal("expired")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, { adLicenseId, status, notes }) => {
    await requireAdminAccess(ctx);
    const license = await ctx.db.get(adLicenseId);
    if (!license) throw new ConvexError({ code: "NOT_FOUND", message: "Project ad license not found" });
    await ctx.db.patch(adLicenseId, { status, notes, lastCheckedAt: Date.now(), updatedAt: Date.now() } as any);
    await ctx.db.patch(license.propertyId, {
      adLicenseStatus: status === "approved" ? "approved" : status === "rejected" ? "rejected" : "pending",
      adLicenseNumber: license.licenseNumber,
      updatedAt: Date.now(),
    } as any);
    const dossier = await requireDossier(ctx, license.dossierId);
    return { ok: true, readiness: await recomputeAndLog(ctx, dossier, "ad_license_reviewed", `Project ad license ${status}.`, { adLicenseId, status, notes }) };
  },
});

export const markWafiLegalReviewed = mutation({
  args: { dossierId: v.id("projectDossiers"), notes: v.optional(v.string()) },
  handler: async (ctx, { dossierId, notes }) => {
    await requireAdminAccess(ctx);
    const dossier = await requireDossier(ctx, dossierId);
    await ctx.db.patch(dossierId, { adminReviewedAt: Date.now(), updatedAt: Date.now() } as any);
    return { ok: true, readiness: await recomputeAndLog(ctx, dossier, "document_reviewed", "WAFI/legal fields were marked reviewed.", { notes }) };
  },
});

export const setProjectAdminBlock = mutation({
  args: { dossierId: v.id("projectDossiers"), blocked: v.boolean(), reason: v.optional(v.string()) },
  handler: async (ctx, { dossierId, blocked, reason }) => {
    await requireAdminAccess(ctx);
    const dossier = await requireDossier(ctx, dossierId);
    await ctx.db.patch(dossierId, {
      adminBlockedReason: blocked ? reason ?? "Blocked by admin review." : undefined,
      updatedAt: Date.now(),
    } as any);
    return {
      ok: true,
      readiness: await recomputeAndLog(
        ctx,
        dossier,
        blocked ? "admin_blocked" : "admin_unblocked",
        blocked ? "Project was blocked by admin review." : "Project admin block was removed.",
        { reason },
      ),
    };
  },
});

export const forceRecomputeProjectReadiness = mutation({
  args: { propertyId: v.id("properties") },
  handler: async (ctx, { propertyId }) => {
    await requireAdminAccess(ctx);
    return { ok: true, readiness: await recomputeProjectReadinessForProperty(ctx, propertyId) };
  },
});

import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";
import { buildOwnerContext, resolveTenantOrgIdForOwner } from "../shared_logic/agencies/repositories/core";
import { buildPropertyProjectionFields } from "../shared_logic/properties/projections";

const BACKFILL_STAGES = [
  "properties",
  "crmClients",
  "deals",
  "searchLogs",
  "organizationApiKeys",
] as const;

type BackfillStage = (typeof BACKFILL_STAGES)[number];

type BackfillCursor = {
  stage: BackfillStage;
  dbCursor: string | null;
};

function encodeBackfillCursor(cursor: BackfillCursor | null) {
  return cursor ? JSON.stringify(cursor) : null;
}

function decodeBackfillCursor(cursor?: string): BackfillCursor {
  if (!cursor) {
    return { stage: BACKFILL_STAGES[0], dbCursor: null };
  }

  const parsed = JSON.parse(cursor) as Partial<BackfillCursor>;
  if (!parsed.stage || !BACKFILL_STAGES.includes(parsed.stage as BackfillStage)) {
    throw new Error("Invalid backfill cursor stage");
  }

  return {
    stage: parsed.stage as BackfillStage,
    dbCursor: typeof parsed.dbCursor === "string" ? parsed.dbCursor : null,
  };
}

function nextBackfillStage(stage: BackfillStage): BackfillStage | null {
  const currentIndex = BACKFILL_STAGES.indexOf(stage);
  return BACKFILL_STAGES[currentIndex + 1] ?? null;
}

function hasPatchFields(patch: Record<string, unknown>) {
  return Object.keys(patch).length > 0;
}

async function paginateStage(ctx: any, stage: BackfillStage, limit: number, dbCursor: string | null) {
  return ctx.db
    .query(stage)
    .order("asc")
    .paginate({ cursor: dbCursor, numItems: limit });
}

async function processPropertiesPage(ctx: any, rows: any[]) {
  let patched = 0;

  for (const property of rows) {
    const ownerField = property.brokerId ? "brokerId" : property.REDId ? "REDId" : null;
    const ownerId = property.brokerId ?? property.REDId;
    if (!ownerField || !ownerId) continue;

    const projections = await buildPropertyProjectionFields(ctx, {
      ownerField,
      ownerId,
      publicationState: property.publicationState ?? "draft",
      adLicenseStatus: property.adLicenseStatus,
    } as any);

    const patch: Record<string, unknown> = {};
    if (property.tenantOrgId === undefined && projections.tenantOrgId !== undefined) patch.tenantOrgId = projections.tenantOrgId;
    if (property.ownerType === undefined && projections.ownerType !== undefined) patch.ownerType = projections.ownerType;
    if (property.ownerCountryCode === undefined && projections.ownerCountryCode !== undefined) {
      patch.ownerCountryCode = projections.ownerCountryCode;
    }
    if (property.ownerVerified === undefined && projections.ownerVerified !== undefined) patch.ownerVerified = projections.ownerVerified;
    if (property.listingVerified === undefined && projections.listingVerified !== undefined) patch.listingVerified = projections.listingVerified;
    if (property.isPublicSearchable === undefined && projections.isPublicSearchable !== undefined) {
      patch.isPublicSearchable = projections.isPublicSearchable;
    }
    if (property.createdAt === undefined) patch.createdAt = property._creationTime;
    if (property.updatedAt === undefined) patch.updatedAt = property.createdAt ?? property._creationTime;

    if (!hasPatchFields(patch)) continue;
    await ctx.db.patch(property._id, patch);
    patched += 1;
  }

  return patched;
}

async function processCrmClientsPage(ctx: any, rows: any[]) {
  let patched = 0;

  for (const client of rows) {
    const owner = client.brokerId
      ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: client.brokerId })
      : client.REDId
        ? buildOwnerContext({ ownerType: "RED", ownerREDId: client.REDId })
        : null;
    if (!owner) continue;

    const patch: Record<string, unknown> = {};
    if (client.tenantOrgId === undefined) patch.tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
    if (client.updatedAt === undefined) patch.updatedAt = client.createdAt ?? client._creationTime;
    if (client.createdAt === undefined) patch.createdAt = client._creationTime;

    if (!hasPatchFields(patch)) continue;
    await ctx.db.patch(client._id, patch);
    patched += 1;
  }

  return patched;
}

async function processDealsPage(ctx: any, rows: any[]) {
  let patched = 0;

  for (const deal of rows) {
    const owner = deal.brokerId
      ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: deal.brokerId })
      : deal.REDId
        ? buildOwnerContext({ ownerType: "RED", ownerREDId: deal.REDId })
        : null;
    if (!owner) continue;

    const patch: Record<string, unknown> = {};
    if (deal.tenantOrgId === undefined) patch.tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
    if (deal.createdAt === undefined) patch.createdAt = deal._creationTime;
    if (deal.updatedAt === undefined) patch.updatedAt = deal.createdAt ?? deal._creationTime;

    if (!hasPatchFields(patch)) continue;
    await ctx.db.patch(deal._id, patch);
    patched += 1;
  }

  return patched;
}

async function processSearchLogsPage(ctx: any, rows: any[]) {
  let patched = 0;

  for (const row of rows) {
    if (row.createdAt !== undefined) continue;
    await ctx.db.patch(row._id, { createdAt: row._creationTime });
    patched += 1;
  }

  return patched;
}

async function processOrganizationApiKeysPage(ctx: any, rows: any[]) {
  let patched = 0;

  for (const apiKey of rows) {
    const owner = apiKey.ownerBrokerId
      ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: apiKey.ownerBrokerId })
      : apiKey.ownerREDId
        ? buildOwnerContext({ ownerType: "RED", ownerREDId: apiKey.ownerREDId })
        : null;
    if (!owner) continue;

    const tenantOrgId = apiKey.tenantOrgId ?? await resolveTenantOrgIdForOwner(ctx, owner);
    const patch: Record<string, unknown> = {};
    if (apiKey.tenantOrgId === undefined) patch.tenantOrgId = tenantOrgId;
    if (apiKey.trustedOrigins === undefined) patch.trustedOrigins = [];
    if (apiKey.quotaWindowMinutes === undefined) patch.quotaWindowMinutes = 60;
    if (apiKey.quotaLimit === undefined) patch.quotaLimit = 1000;
    if (apiKey.quotaUsed === undefined) patch.quotaUsed = 0;
    if (apiKey.quotaWindowStartedAt === undefined) patch.quotaWindowStartedAt = apiKey.createdAt;
    if (apiKey.anomalyFlags === undefined) patch.anomalyFlags = [];

    if (hasPatchFields(patch)) {
      await ctx.db.patch(apiKey._id, patch);
      patched += 1;
    }

    const existingPolicy = await ctx.db
      .query("organizationIntegrationPolicies")
      .withIndex("tenantOrgId", (q: any) => q.eq("tenantOrgId", tenantOrgId))
      .first();
    if (existingPolicy) continue;

    await ctx.db.insert("organizationIntegrationPolicies", {
      tenantOrgId,
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      trustedOrigins: [],
      trustedCallbackBaseUrls: [],
      allowedWebhookDomains: [],
      enabledModes: ["api_keys"],
      policyStatus: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastReviewedAt: undefined,
    });
  }

  return patched;
}

async function processBackfillStagePage(ctx: any, stage: BackfillStage, rows: any[]) {
  switch (stage) {
    case "properties":
      return processPropertiesPage(ctx, rows);
    case "crmClients":
      return processCrmClientsPage(ctx, rows);
    case "deals":
      return processDealsPage(ctx, rows);
    case "searchLogs":
      return processSearchLogsPage(ctx, rows);
    case "organizationApiKeys":
      return processOrganizationApiKeysPage(ctx, rows);
  }
}

async function upsertHealthSummary(args: {
  ctx: any;
  summaryType: string;
  status: "healthy" | "warning" | "critical";
  value?: number;
  recordCount?: number;
  staleAfterMs?: number;
  details?: Record<string, unknown>;
}) {
  const now = Date.now();
  const existing = await args.ctx.db
    .query("adminDataHealthSummaries")
    .withIndex("summaryType", (q: any) => q.eq("summaryType", args.summaryType))
    .first();
  const patch = {
    status: args.status,
    value: args.value,
    recordCount: args.recordCount,
    staleAfterMs: args.staleAfterMs,
    lastAggregatedAt: now,
    staleSince: undefined,
    details: args.details,
    updatedAt: now,
  };
  if (existing) {
    await args.ctx.db.patch(existing._id, patch);
    return;
  }
  await args.ctx.db.insert("adminDataHealthSummaries", {
    summaryType: args.summaryType,
    tenantOrgId: undefined,
    ...patch,
  });
}

/**
 * WHY:   The new tenant-first/read-optimized schema needs a safe admin repair path for legacy rows.
 * WHAT:  Backfills tenant, timestamp, property searchability, policy, and quota fields in bounded batches.
 * HOW:   Admin-only mutation scans a limited batch of legacy rows, derives missing fields, and patches only absent values.
 */
export const backfillScaleControlPlane = mutation({
  args: {
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, { limit = 200, cursor }) => {
    await requireAdminAccess(ctx);
    const current = decodeBackfillCursor(cursor);
    const page = await paginateStage(ctx, current.stage, limit, current.dbCursor);
    const patched = await processBackfillStagePage(ctx, current.stage, page.page as any[]);

    if (!page.isDone && page.continueCursor) {
      return {
        patched,
        cursor: encodeBackfillCursor({ stage: current.stage, dbCursor: page.continueCursor }),
        isDone: false,
      };
    }

    const nextStage = nextBackfillStage(current.stage);
    return {
      patched,
      cursor: encodeBackfillCursor(nextStage ? { stage: nextStage, dbCursor: null } : null),
      isDone: nextStage === null,
    };
  },
});

/**
 * WHY:   Admin control-room analytics should report data freshness and projection health without scanning the UI layer.
 * WHAT:  Recomputes a compact set of data-health summaries from the live Convex tables.
 * HOW:   Admin-only mutation samples the projection tables and core logs, then upserts summary rows keyed by subsystem.
 */
export const rebuildAdminDataHealthSummaries = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdminAccess(ctx);
    const [engagement, brokerAnalytics, searchLogs, apiKeys] = await Promise.all([
      ctx.db.query("propertyEngagementDaily").collect(),
      ctx.db.query("propertyBrokerAnalytics").collect(),
      ctx.db.query("searchLogs").collect(),
      ctx.db.query("organizationApiKeys").collect(),
    ]);
    await upsertHealthSummary({
      ctx,
      summaryType: "property_engagement_rollups",
      status: engagement.length > 0 ? "healthy" : "warning",
      recordCount: engagement.length,
      value: engagement.reduce((sum, row) => sum + row.views + row.clicks, 0),
      details: {
        latestDateKey: engagement.map((row) => row.dateKey).sort().at(-1) ?? null,
      },
    });
    await upsertHealthSummary({
      ctx,
      summaryType: "property_broker_analytics",
      status: brokerAnalytics.length > 0 ? "healthy" : "warning",
      recordCount: brokerAnalytics.length,
      value: brokerAnalytics.filter((row) => (row.lastActivityAt ?? 0) > 0).length,
    });
    await upsertHealthSummary({
      ctx,
      summaryType: "search_logs",
      status: searchLogs.some((row) => !row.createdAt) ? "warning" : "healthy",
      recordCount: searchLogs.length,
      value: searchLogs.filter((row) => row.status === "failed" || row.errorMessage).length,
    });
    await upsertHealthSummary({
      ctx,
      summaryType: "api_key_risk",
      status: apiKeys.some((row) => row.lastDeniedAt) ? "warning" : "healthy",
      recordCount: apiKeys.length,
      value: apiKeys.filter((row) => row.lastDeniedAt).length,
      details: {
        suspended: apiKeys.filter((row) => row.status === "suspended").length,
        restrictedOrigins: apiKeys.filter((row) => (row.trustedOrigins?.length ?? 0) > 0).length,
      },
    });
    return { ok: true as const };
  },
});

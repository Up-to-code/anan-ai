import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { buildOwnerContext, resolveTenantOrgIdForOwner } from "../shared_logic/agencies/repositories/core";
import { buildPropertyProjectionFields } from "../shared_logic/properties/projections";

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
  },
  handler: async (ctx, { limit = 200 }) => {
    await requireRole(ctx, ["admin"]);
    let patched = 0;

    const properties = (await ctx.db.query("properties").take(limit)) as any[];
    for (const property of properties) {
      const ownerField = property.brokerId ? "brokerId" : property.REDId ? "REDId" : null;
      const ownerId = property.brokerId ?? property.REDId;
      if (!ownerField || !ownerId) continue;
      const projections = await buildPropertyProjectionFields(ctx, {
        ownerField,
        ownerId,
        publicationState: property.publicationState ?? "draft",
        adLicenseStatus: property.adLicenseStatus,
      } as any);
      await ctx.db.patch(property._id, {
        tenantOrgId: property.tenantOrgId ?? projections.tenantOrgId,
        ownerType: property.ownerType ?? projections.ownerType,
        ownerCountryCode: property.ownerCountryCode ?? projections.ownerCountryCode,
        ownerVerified: property.ownerVerified ?? projections.ownerVerified,
        listingVerified: property.listingVerified ?? projections.listingVerified,
        isPublicSearchable: property.isPublicSearchable ?? projections.isPublicSearchable,
        createdAt: property.createdAt ?? property._creationTime,
        updatedAt: property.updatedAt ?? property.createdAt ?? property._creationTime,
      });
      patched += 1;
    }

    const crmClients = (await ctx.db.query("crmClients").take(limit)) as any[];
    for (const client of crmClients) {
      const owner = client.brokerId
        ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: client.brokerId })
        : client.REDId
          ? buildOwnerContext({ ownerType: "RED", ownerREDId: client.REDId })
          : null;
      if (!owner) continue;
      await ctx.db.patch(client._id, {
        tenantOrgId: client.tenantOrgId ?? await resolveTenantOrgIdForOwner(ctx, owner),
        updatedAt: client.updatedAt ?? client.createdAt ?? client._creationTime,
        createdAt: client.createdAt ?? client._creationTime,
      });
      patched += 1;
    }

    const deals = (await ctx.db.query("deals").take(limit)) as any[];
    for (const deal of deals) {
      const owner = deal.brokerId
        ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: deal.brokerId })
        : deal.REDId
          ? buildOwnerContext({ ownerType: "RED", ownerREDId: deal.REDId })
          : null;
      if (!owner) continue;
      await ctx.db.patch(deal._id, {
        tenantOrgId: deal.tenantOrgId ?? await resolveTenantOrgIdForOwner(ctx, owner),
        createdAt: deal.createdAt ?? deal._creationTime,
        updatedAt: deal.updatedAt ?? deal.createdAt ?? deal._creationTime,
      });
      patched += 1;
    }

    const searchLogs = (await ctx.db.query("searchLogs").take(limit)) as any[];
    for (const row of searchLogs) {
      if (row.createdAt) continue;
      await ctx.db.patch(row._id, { createdAt: row._creationTime });
      patched += 1;
    }

    const apiKeys = (await ctx.db.query("organizationApiKeys").take(limit)) as any[];
    for (const apiKey of apiKeys) {
      const owner = apiKey.ownerBrokerId
        ? buildOwnerContext({ ownerType: "broker", ownerBrokerId: apiKey.ownerBrokerId })
        : apiKey.ownerREDId
          ? buildOwnerContext({ ownerType: "RED", ownerREDId: apiKey.ownerREDId })
          : null;
      if (!owner) continue;
      const tenantOrgId = apiKey.tenantOrgId ?? await resolveTenantOrgIdForOwner(ctx, owner);
      await ctx.db.patch(apiKey._id, {
        tenantOrgId,
        trustedOrigins: apiKey.trustedOrigins ?? [],
        quotaWindowMinutes: apiKey.quotaWindowMinutes ?? 60,
        quotaLimit: apiKey.quotaLimit ?? 1000,
        quotaUsed: apiKey.quotaUsed ?? 0,
        quotaWindowStartedAt: apiKey.quotaWindowStartedAt ?? apiKey.createdAt,
        anomalyFlags: apiKey.anomalyFlags ?? [],
      });
      const existingPolicy = await ctx.db
        .query("organizationIntegrationPolicies")
        .withIndex("tenantOrgId", (q: any) => q.eq("tenantOrgId", tenantOrgId))
        .first();
      if (!existingPolicy) {
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
      patched += 1;
    }

    return { patched };
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
    await requireRole(ctx, ["admin"]);
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

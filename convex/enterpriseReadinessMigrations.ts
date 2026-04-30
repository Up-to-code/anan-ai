import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";
import { requireAdminAccess } from "./_core/security/accessPolicy";

const PAGE_SIZE = 64;

const SECURITY_BACKFILL_TABLES = [
  "authUsers",
  "organizations",
  "orgMemberships",
  "orgInvites",
  "orgSubscriptions",
  "userProfiles",
  "users",
  "oauthClients",
  "oauthGrants",
  "accessTokens",
  "oauthAuthorizations",
  "oauthAuthCodes",
  "oauthAccessTokens",
  "oauthRefreshTokens",
  "oauthFlowState",
  "oauthSubjectMappings",
  "oauthAuditLogs",
  "organizationApiKeys",
  "organizationIntegrationPolicies",
  "organizationApiKeyUsageDaily",
  "teamInvites",
  "organizationMemberships",
  "properties",
  "propertyViewerAccess",
  "projectAnalyticsEvents",
  "propertyEngagementDaily",
  "propertyBrokerAnalytics",
  "organizationProjectSummaries",
  "organizationAssets",
  "projectDossiers",
  "projectUnits",
  "projectPaymentPlans",
  "projectComplianceDocuments",
  "projectAdLicenses",
  "projectBrokerAuthorizations",
  "projectReadinessEvents",
  "crmClients",
  "crmContacts",
  "deals",
  "orders",
  "offers",
  "offerPackages",
  "offerCases",
  "offerCaseParticipants",
  "caseParticipants",
  "offerActivities",
  "caseActivities",
  "inboxConversations",
  "inboxConversationParticipants",
  "inboxMessages",
  "workspaceNotifications",
  "workspaceNotificationPreferences",
  "workspacePushSubscriptions",
  "assistantThreads",
  "assistantMessages",
  "assistantThreadState",
  "assistantMessageState",
  "assistantStreamEvents",
  "agentMemory",
  "userKnowledgeBase",
  "entityRelations",
  "aiTokenUsage",
  "aiOrchestrationUsage",
  "aiRAGEntries",
  "knowledgePages",
  "developerHandbookPages",
  "globalSearchCache",
  "knowledgeResearch",
  "searchLogs",
  "complianceRulesets",
  "verificationRequests",
  "adminDataHealthSummaries",
  "adminSignupInvites",
  "contactInquiries",
  "formSubmissions",
  "banks",
  "auditLog",
  "encryptionKeys",
] as const;

function getInternalFunction(name: string) {
  return (internal as any).enterpriseReadinessMigrations[name];
}

function buildSecurityPatch(doc: any, actorAuthUserId: string, now: number) {
  const patch: Record<string, unknown> = {};
  if (doc.createdBy === undefined) patch.createdBy = actorAuthUserId;
  if (doc.updatedBy === undefined) patch.updatedBy = actorAuthUserId;
  if (doc.encryptedFields === undefined) patch.encryptedFields = [];
  if (doc.createdAt === undefined) patch.createdAt = doc._creationTime ?? now;
  if (doc.updatedAt === undefined) patch.updatedAt = doc.updatedAt ?? doc.createdAt ?? doc._creationTime ?? now;
  return patch;
}

/**
 * WHY:   Enterprise schema hardening needs resumable Convex-native backfills.
 * WHAT:  Schedules one paginated internal mutation per table to fill security fields.
 * HOW:   Admin supplies the canonical authUsers id used as migration actor.
 */
export const startSecurityFieldBackfill = mutation({
  args: {
    actorAuthUserId: v.id("authUsers"),
    tables: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    const selectedTables = args.tables?.length
      ? args.tables
      : [...SECURITY_BACKFILL_TABLES];
    for (const table of selectedTables) {
      await ctx.scheduler.runAfter(0, getInternalFunction("securityFieldBackfillPage"), {
        table,
        cursor: null,
        actorAuthUserId: args.actorAuthUserId,
      });
    }
    return { scheduledTables: selectedTables.length };
  },
});

export const securityFieldBackfillPage = internalMutation({
  args: {
    table: v.string(),
    cursor: v.union(v.string(), v.null()),
    actorAuthUserId: v.id("authUsers"),
  },
  handler: async (ctx, args) => {
    if (!SECURITY_BACKFILL_TABLES.includes(args.table as any)) {
      throw new Error(`Unsupported enterprise security backfill table: ${args.table}`);
    }
    const now = Date.now();
    const result = await (ctx.db.query(args.table as any) as any)
      .order("asc")
      .paginate({ cursor: args.cursor, numItems: PAGE_SIZE });
    let patched = 0;
    for (const doc of result.page as any[]) {
      const patch = buildSecurityPatch(doc, args.actorAuthUserId, now);
      if (Object.keys(patch).length > 0) {
        await (ctx.db.patch as any)(doc._id, patch);
        patched += 1;
      }
    }
    if (!result.isDone) {
      await ctx.scheduler.runAfter(0, getInternalFunction("securityFieldBackfillPage"), {
        table: args.table,
        cursor: result.continueCursor,
        actorAuthUserId: args.actorAuthUserId,
      });
    }
    return {
      table: args.table,
      patched,
      isDone: result.isDone,
      continueCursor: result.continueCursor,
    };
  },
});

/**
 * WHY:   Cutover gates need a cheap signal that no sampled active rows are missing
 *        enterprise security fields.
 * WHAT:  Scans a bounded page per table and returns the first gaps.
 * HOW:   This is intentionally conservative; full verification should run by table
 *        with paginated jobs before removing legacy fields.
 */
export const validateSecurityFieldSample = query({
  args: {
    tables: v.optional(v.array(v.string())),
    sampleSize: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    const selectedTables = args.tables?.length
      ? args.tables
      : [...SECURITY_BACKFILL_TABLES];
    const sampleSize = Math.min(Math.max(args.sampleSize ?? 25, 1), 200);
    const gaps: Array<{ table: string; id: string; missing: string[] }> = [];
    for (const table of selectedTables) {
      if (!SECURITY_BACKFILL_TABLES.includes(table as any)) continue;
      const rows = await (ctx.db.query(table as any) as any)
        .order("asc")
        .take(sampleSize);
      for (const row of rows as any[]) {
        const missing = ["createdBy", "updatedBy", "encryptedFields", "createdAt", "updatedAt"]
          .filter((field) => row[field] === undefined);
        if (missing.length > 0) {
          gaps.push({ table, id: String(row._id), missing });
          break;
        }
      }
    }
    return { checkedTables: selectedTables.length, sampleSize, gaps };
  },
});

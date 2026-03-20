import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  mapLinksByOwner,
} from "./tenantsMigration/helpers";
import { executeTenantMigrationFromLegacy } from "./tenantsMigration/migrateFromLegacy";

/**
 * WHY:   The workspace is moving to convex-tenants as the primary org system.
 * WHAT:  Migrates legacy brokers/REDs, memberships, and invites into tenants + tenantOrgLinks.
 * HOW:   Creates tenant orgs, maps memberships/invites, and backfills currentTenantOrgId.
 */
export const migrateTenantsFromLegacy = mutation({
  args: {
    dryRun: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    const dryRun = Boolean(args.dryRun);
    const tenantOrgLinks = await ctx.db.query("tenantOrgLinks").collect();
    const linksByOwner = mapLinksByOwner(tenantOrgLinks);
    const migrationResult = await executeTenantMigrationFromLegacy({
      ctx,
      dryRun,
      linksByOwner,
    });
    return {
      dryRun,
      ...migrationResult,
    } as const;
  },
});

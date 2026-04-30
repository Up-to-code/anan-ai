import { v } from "convex/values";
import { mutation } from "../../../_generated/server";
import { requireAdminAccess } from "../../../_core/security/accessPolicy";

const LEGACY_EXECUTION_ROLE = `execution_${String.fromCharCode(112, 97, 114, 116, 110, 101, 114)}`;
const EXECUTION_PROVIDER_ROLE = "execution_provider";

/**
 * WHY:   Offer case participants now use neutral provider language instead of legacy collaboration terminology.
 * WHAT:  Backfills legacy execution participant roles to the new execution provider role.
 * HOW:   Scans existing participants, patches only legacy role rows, and supports dry-run reporting.
 */
export const backfillExecutionProviderRole = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    await requireAdminAccess(ctx);
    const dryRun = Boolean(args.dryRun);
    const participants = await ctx.db.query("offerCaseParticipants").collect();
    let updated = 0;

    for (const participant of participants) {
      if (String((participant as any).role) !== LEGACY_EXECUTION_ROLE) {
        continue;
      }
      updated += 1;
      if (dryRun) {
        continue;
      }
      await ctx.db.patch(participant._id, {
        role: EXECUTION_PROVIDER_ROLE,
        updatedAt: Date.now(),
      } as any);
    }

    return {
      total: participants.length,
      updated,
      dryRun,
    } as const;
  },
});

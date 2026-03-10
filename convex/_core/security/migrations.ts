import { mutation } from "../../_generated/server";
import { v } from "convex/values";

/**
 * WHY:   One-off migration to normalize legacy roles into the new RBAC model.
 * WHAT:  Maps RED→developer, defaults missing roles to user, and sets roleStatus to approved.
 * HOW:   Iterates all userProfiles and patches records without changing broker/RED links.
 */
export const backfillUserProfilesV3 = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updated = 0;
    for (const profile of profiles) {
      let nextRole = profile.role;
      if ((profile.role as string) === "RED") {
        nextRole = "developer";
      }

      if (!nextRole) {
        nextRole = "user";
      }

      const roleStatus = profile.roleStatus ?? "approved";

      const requestedRole =
        profile.requestedRole && (profile.requestedRole as string) !== "RED"
          ? profile.requestedRole
          : undefined;

      const needsUpdate =
        nextRole !== profile.role ||
        roleStatus !== profile.roleStatus ||
        requestedRole !== profile.requestedRole;

      if (!needsUpdate) continue;

      updated += 1;
      if (args.dryRun) continue;

      await ctx.db.patch(profile._id, {
        role: nextRole,
        roleStatus,
        requestedRole,
      });
    }

    return { total: profiles.length, updated, dryRun: Boolean(args.dryRun) } as const;
  },
});

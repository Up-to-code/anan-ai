import { mutation } from "../../_generated/server";
import { v } from "convex/values";

function resolveWorkspaceSecurityUsernameUpdate(profile: {
  email?: string;
  username?: string;
  usernameLower?: string;
}) {
  const emailLocalPart = profile.email?.split("@")[0]?.trim();
  const username = profile.username ?? emailLocalPart ?? undefined;
  const usernameLower = username?.toLowerCase();
  const changed =
    (username && profile.username !== username) ||
    (usernameLower && profile.usernameLower !== usernameLower);
  if (!changed) return null;
  return { username, usernameLower, updatedAt: Date.now() };
}

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

/**
 * WHY:   Workspace security now depends on normalized usernames and tenant-backed memberships.
 * WHAT:  Backfills missing usernames for legacy profiles without touching membership rows.
 * HOW:   Derives usernames from email when absent and patches userProfiles in place.
 */
export const backfillWorkspaceSecurityV4 = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updatedProfiles = 0;

    for (const profile of profiles) {
      const update = resolveWorkspaceSecurityUsernameUpdate(profile);
      if (!update) continue;
      updatedProfiles += 1;
      if (args.dryRun) continue;
      await ctx.db.patch(profile._id, update);
    }

    return {
      total: profiles.length,
      updatedProfiles,
      dryRun: Boolean(args.dryRun),
    } as const;
  },
});

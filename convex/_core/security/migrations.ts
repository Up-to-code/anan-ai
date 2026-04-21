import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { normalizeUserProfileRoleState } from "./profileRoles";

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
 * WHY:   Dashboard-edited profiles and legacy role docs need one canonical shape.
 * WHAT:  Backfills canonical user role fields and removes stale legacy aliases.
 * HOW:   Iterates all userProfiles, normalizes role state, and patches only changed fields.
 */
export const backfillUserProfilesV3 = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updated = 0;
    for (const profile of profiles) {
      const normalized = normalizeUserProfileRoleState(profile as any);

      const needsUpdate =
        normalized.role !== (profile as any).role ||
        normalized.roleApprovalStatus !== (profile as any).roleApprovalStatus ||
        normalized.requestedRole !== (profile as any).requestedRole ||
        normalized.brokerId !== (profile as any).brokerId ||
        normalized.developerId !== ((profile as any).developerId ?? (profile as any).REDId) ||
        (profile as any).roleStatus !== undefined ||
        (profile as any).REDId !== undefined;

      if (!needsUpdate) continue;

      updated += 1;
      if (args.dryRun) continue;

      await ctx.db.patch(profile._id, {
        role: normalized.role,
        roleApprovalStatus: normalized.roleApprovalStatus,
        requestedRole: normalized.requestedRole,
        brokerId: normalized.brokerId,
        developerId: normalized.developerId,
        roleStatus: undefined,
        REDId: undefined,
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

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

/**
 * WHY:   Workspace security now depends on normalized usernames and explicit organization memberships.
 * WHAT:  Backfills missing usernames and owner-manager memberships for legacy profiles.
 * HOW:   Derives usernames from email when absent and creates one active manager membership for each owned broker/RED.
 */
export const backfillWorkspaceSecurityV4 = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const profiles = await ctx.db.query("userProfiles").collect();
    let updatedProfiles = 0;
    let createdMemberships = 0;

    for (const profile of profiles) {
      const emailLocalPart = profile.email?.split("@")[0]?.trim();
      const username = profile.username ?? emailLocalPart ?? undefined;
      const usernameLower = username?.toLowerCase();

      if ((username && profile.username !== username) || (usernameLower && profile.usernameLower !== usernameLower)) {
        updatedProfiles += 1;
        if (!args.dryRun) {
          await ctx.db.patch(profile._id, {
            username,
            usernameLower,
            updatedAt: Date.now(),
          });
        }
      }

      const ownerType = profile.brokerId ? "broker" : profile.REDId ? "RED" : null;
      const ownerId = profile.brokerId ?? profile.REDId ?? null;
      if (!ownerType || !ownerId) continue;

      const existingMembership = ownerType === "broker"
        ? await ctx.db
            .query("organizationMemberships")
            .withIndex("ownerBrokerId_authUserId", (q) => q.eq("ownerBrokerId", profile.brokerId!).eq("authUserId", profile.authUserId))
            .unique()
        : await ctx.db
            .query("organizationMemberships")
            .withIndex("ownerREDId_authUserId", (q) => q.eq("ownerREDId", profile.REDId!).eq("authUserId", profile.authUserId))
            .unique();

      if (existingMembership) continue;

      createdMemberships += 1;
      if (!args.dryRun) {
        await ctx.db.insert("organizationMemberships", {
          ownerType,
          ownerBrokerId: ownerType === "broker" ? profile.brokerId : undefined,
          ownerREDId: ownerType === "RED" ? profile.REDId : undefined,
          authUserId: profile.authUserId,
          profileId: profile._id,
          role: "manager",
          status: "active",
          createdAt: Date.now(),
          updatedAt: Date.now(),
          invitedBy: profile.authUserId,
        });
      }
    }

    return {
      total: profiles.length,
      updatedProfiles,
      createdMemberships,
      dryRun: Boolean(args.dryRun),
    } as const;
  },
});

import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import {
  findProfileForResolvedIdentity,
  requireResolvedIdentity,
} from "../../_core/security/identity";

async function getCurrentProfile(ctx: QueryCtx | MutationCtx) {
  try {
    const identity = await requireResolvedIdentity(ctx);
    const profile = await findProfileForResolvedIdentity(ctx, identity);
    return { identity, profile };
  } catch {
    return null;
  }
}

function normalizeUsername(value: string) {
  return value.trim().toLowerCase();
}

function deriveFallbackUsername(args: { email?: string | null; name?: string | null; authUserId: string }) {
  const emailLocalPart = args.email?.split("@")[0]?.trim();
  const seed = emailLocalPart || args.name || `user-${args.authUserId.slice(-6)}`;
  return seed
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32) || `user-${args.authUserId.slice(-6)}`;
}

async function ensureUsernameIsAvailable(
  ctx: QueryCtx | MutationCtx,
  args: { usernameLower: string; profileId: string },
) {
  const existing = await ctx.db
    .query("userProfiles")
    .withIndex("usernameLower", (q) => q.eq("usernameLower", args.usernameLower))
    .first();
  if (existing && existing._id !== args.profileId) {
    throw new ConvexError({ code: "USERNAME_TAKEN", message: "Username is already taken" });
  }
}

/**
 * WHY:   Exposes the caller's profile for client-side role gating.
 * WHAT:  Returns account identity, role state, and organization links for the current caller.
 * HOW:   Reads from userProfiles keyed by current auth identity.
 */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile) return null;
    const username = current.profile.username ?? deriveFallbackUsername({
      email: current.profile.email ?? current.identity.email ?? null,
      name: current.profile.name ?? current.identity.name ?? null,
      authUserId: current.identity.authUserId,
    });
    return {
      email: current.profile.email ?? current.identity.email ?? undefined,
      name: current.profile.name ?? current.identity.name ?? undefined,
      username,
      role: current.profile.role,
      roleStatus: current.profile.roleStatus,
      requestedRole: current.profile.requestedRole,
      brokerId: current.profile.brokerId,
      REDId: current.profile.REDId,
      showInOffersDirectory: current.profile.showInOffersDirectory ?? true,
      isActive: current.profile.isActive,
      authProvider: {
        id: "google",
        passwordManaged: false,
      },
    } as const;
  },
});

/**
 * WHY:   Profile edits must be server-owned so username uniqueness and active-account checks are enforced centrally.
 * WHAT:  Updates the current user's display name and unique username.
 * HOW:   Resolves the caller, validates uniqueness through the normalized username index, then patches the profile record.
 */
export const updateMyProfile = mutation({
  args: {
    name: v.string(),
    username: v.string(),
    showInOffersDirectory: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const current = await getCurrentProfile(ctx);
    if (!current?.profile) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
    }

    const name = args.name.trim().replace(/\s+/g, " ");
    const username = args.username.trim();
    const usernameLower = normalizeUsername(username);

    if (!name || name.length < 2) {
      throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Profile name must be at least 2 characters" });
    }
    if (!usernameLower || usernameLower.length < 3) {
      throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Username must be at least 3 characters" });
    }

    await ensureUsernameIsAvailable(ctx, {
      usernameLower,
      profileId: current.profile._id,
    });

    await ctx.db.patch(current.profile._id, {
      name,
      username,
      usernameLower,
      showInOffersDirectory: args.showInOffersDirectory ?? current.profile.showInOffersDirectory ?? true,
      updatedAt: Date.now(),
    });

    return {
      email: current.profile.email ?? current.identity.email ?? undefined,
      name,
      username,
      role: current.profile.role,
      roleStatus: current.profile.roleStatus,
      requestedRole: current.profile.requestedRole,
      brokerId: current.profile.brokerId,
      REDId: current.profile.REDId,
      showInOffersDirectory: args.showInOffersDirectory ?? current.profile.showInOffersDirectory ?? true,
      isActive: current.profile.isActive,
      authProvider: {
        id: "google",
        passwordManaged: false,
      },
    } as const;
  },
});

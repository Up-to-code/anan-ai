import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../_generated/server";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import {
  findProfileForResolvedIdentity,
  requireResolvedIdentity,
} from "../../_core/security/identity";
import { normalizeUserProfileRoleState } from "../../_core/security/profileRoles";

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

function buildMyProfileResponse(args: {
  identity: { email?: string | null };
  profile: {
    email?: string | null;
    role?: string | null;
    roleApprovalStatus?: string | null;
    requestedRole?: string | null;
    brokerId?: string | null;
    developerId?: string | null;
    isActive?: boolean;
  };
  name: string | undefined;
  username: string;
  showInOffersDirectory: boolean;
}) {
  return {
    email: args.profile.email ?? args.identity.email ?? undefined,
    name: args.name,
    username: args.username,
    role: args.profile.role,
    roleApprovalStatus: args.profile.roleApprovalStatus,
    requestedRole: args.profile.requestedRole,
    brokerId: args.profile.brokerId,
    developerId: args.profile.developerId,
    showInOffersDirectory: args.showInOffersDirectory,
    isActive: args.profile.isActive,
    authProvider: { id: "google", passwordManaged: false },
  } as const;
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

async function deriveAvailableUsername(
  ctx: QueryCtx | MutationCtx,
  args: { email?: string | null; name?: string | null; authUserId: string },
) {
  const base = deriveFallbackUsername(args);
  const suffix = args.authUserId.slice(-6).toLowerCase().replace(/[^a-z0-9]+/g, "") || "user";
  const candidates = [
    base,
    `${base.slice(0, Math.max(3, 31 - suffix.length))}-${suffix}`.slice(0, 32),
  ];

  for (const candidate of candidates) {
    const usernameLower = normalizeUsername(candidate);
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("usernameLower", (q) => q.eq("usernameLower", usernameLower))
      .first();
    if (!existing) {
      return { username: candidate, usernameLower };
    }
  }

  const fallback = `user-${suffix}`.slice(0, 32);
  return { username: fallback, usernameLower: normalizeUsername(fallback) };
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
    const normalizedRoleState = normalizeUserProfileRoleState(current.profile);
    return buildMyProfileResponse({
      identity: current.identity,
      profile: {
        ...current.profile,
        role: normalizedRoleState.role,
        roleApprovalStatus: normalizedRoleState.roleApprovalStatus,
        requestedRole: normalizedRoleState.requestedRole,
        developerId: normalizedRoleState.developerId,
      },
      name: current.profile.name ?? current.identity.name ?? undefined,
      username,
      showInOffersDirectory: current.profile.showInOffersDirectory ?? true,
    });
  },
});

/**
 * WHY:   Better Auth creates the auth account before Anan has a workspace profile row.
 * WHAT:  Ensures the current auth identity has a fresh app profile for workspace onboarding.
 * HOW:   Reuses email fallback for old rows, otherwise inserts a minimal active profile.
 */
export const ensureMyProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireResolvedIdentity(ctx);
    const existing = await findProfileForResolvedIdentity(ctx, identity);
    const now = Date.now();

    if (existing) {
      const patch: Partial<typeof existing> = {};
      if (existing.authUserId !== identity.authUserId) {
        patch.authUserId = identity.authUserId;
      }
      if (!existing.email && identity.email) {
        patch.email = identity.email;
      }
      if (!existing.name && identity.name) {
        patch.name = identity.name;
      }
      if (existing.isActive === false) {
        patch.isActive = true;
      }
      if (Object.keys(patch).length > 0) {
        await ctx.db.patch(existing._id, { ...patch, updatedAt: now });
      }

      const updated = { ...existing, ...patch };
      const username = updated.username ?? deriveFallbackUsername({
        email: updated.email ?? identity.email ?? null,
        name: updated.name ?? identity.name ?? null,
        authUserId: identity.authUserId,
      });
      const normalizedRoleState = normalizeUserProfileRoleState(updated);
      return buildMyProfileResponse({
        identity,
        profile: {
          ...updated,
          role: normalizedRoleState.role,
          roleApprovalStatus: normalizedRoleState.roleApprovalStatus,
          requestedRole: normalizedRoleState.requestedRole,
          developerId: normalizedRoleState.developerId,
          isActive: updated.isActive ?? true,
        },
        name: updated.name ?? identity.name ?? undefined,
        username,
        showInOffersDirectory: updated.showInOffersDirectory ?? true,
      });
    }

    const { username, usernameLower } = await deriveAvailableUsername(ctx, {
      email: identity.email,
      name: identity.name,
      authUserId: identity.authUserId,
    });
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: identity.authUserId,
      email: identity.email,
      name: identity.name,
      username,
      usernameLower,
      showInOffersDirectory: true,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const profile = await ctx.db.get(profileId);
    if (!profile) {
      throw new ConvexError({ code: "INTERNAL_ERROR", message: "Profile bootstrap failed" });
    }

    return buildMyProfileResponse({
      identity,
      profile: { ...profile, isActive: true },
      name: profile.name ?? identity.name ?? undefined,
      username,
      showInOffersDirectory: true,
    });
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
    return buildMyProfileResponse({
      identity: current.identity,
      profile: current.profile,
      name,
      username,
      showInOffersDirectory: args.showInOffersDirectory ?? current.profile.showInOffersDirectory ?? true,
    });
  },
});

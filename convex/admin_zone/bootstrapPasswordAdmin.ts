import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  ADMIN_OWNER_PERMISSIONS,
  buildAdminPlatformAccess,
  mergeProfileAdminAccessMetadata,
} from "../_core/security/adminAccess";

function readRequiredSecret() {
  const secret = process.env.ADMIN_BOOTSTRAP_SECRET?.trim();
  if (!secret) {
    throw new ConvexError({
      code: "ADMIN_BOOTSTRAP_DISABLED",
      message: "ADMIN_BOOTSTRAP_SECRET is not configured.",
    });
  }
  return secret;
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new ConvexError({
      code: "INVALID_EMAIL",
      message: "A valid admin email is required.",
    });
  }
  return email;
}

function deriveBootstrapAuthUserId(email: string) {
  return `admin-password:${email}`;
}

/**
 * WHY:   The admin app no longer exposes public registration, but the first password admin still needs a trusted bootstrap path.
 * WHAT:  Creates or updates the matching `userProfiles` row with business `user` role plus platform-admin metadata.
 * HOW:   Requires a deployment secret, keys by normalized email, and remains idempotent for repeated local script runs.
 */
export const ensureAdminPasswordProfile = mutation({
  args: {
    secret: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const expectedSecret = readRequiredSecret();
    if (args.secret !== expectedSecret) {
      throw new ConvexError({
        code: "ADMIN_BOOTSTRAP_FORBIDDEN",
        message: "Invalid admin bootstrap secret.",
      });
    }

    const email = normalizeEmail(args.email);
    const name = args.name?.trim() || undefined;
    const now = Date.now();
    const metadata = buildAdminPlatformAccess({
      level: "owner",
      permissions: ADMIN_OWNER_PERMISSIONS,
      grantedAt: now,
      reason: "admin_password_bootstrap",
    });
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email,
        ...(name ? { name } : {}),
        role: "user",
        roleApprovalStatus: "approved",
        requestedRole: undefined,
        brokerId: undefined,
        developerId: undefined,
        roleStatus: undefined,
        REDId: undefined,
        metadata: mergeProfileAdminAccessMetadata(existing.metadata, metadata),
        isActive: true,
        updatedAt: now,
      });

      return {
        profileId: existing._id,
        email,
        created: false,
        role: "user" as const,
        isAdmin: true,
      };
    }

    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: deriveBootstrapAuthUserId(email),
      email,
      ...(name ? { name } : {}),
      role: "user",
      roleApprovalStatus: "approved",
      metadata: mergeProfileAdminAccessMetadata(undefined, metadata),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return {
      profileId,
      email,
      created: true,
      role: "user" as const,
      isAdmin: true,
    };
  },
});

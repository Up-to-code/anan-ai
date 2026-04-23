import { ConvexError, v } from "convex/values";
import { mutation } from "../_generated/server";
import {
  ADMIN_OWNER_PERMISSIONS,
  buildAdminPlatformAccess,
  mergeProfileAdminAccessMetadata,
  adminAccessLevelValidator,
  adminPermissionValidator,
  type AdminPermission,
} from "../_core/security/adminAccess";
import { requireAdminAccess } from "../_core/security/accessPolicy";

const encoder = new TextEncoder();
const BASE64URL_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

function base64UrlEncode(bytes: Uint8Array) {
  let output = "";
  for (let index = 0; index < bytes.length; index += 3) {
    const a = bytes[index]!;
    const b = bytes[index + 1] ?? 0;
    const c = bytes[index + 2] ?? 0;
    const triple = (a << 16) | (b << 8) | c;
    output += BASE64URL_ALPHABET[(triple >> 18) & 0x3f];
    output += BASE64URL_ALPHABET[(triple >> 12) & 0x3f];
    if (index + 1 < bytes.length) output += BASE64URL_ALPHABET[(triple >> 6) & 0x3f];
    if (index + 2 < bytes.length) output += BASE64URL_ALPHABET[triple & 0x3f];
  }
  return output;
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value && value.length > 0 ? value : undefined;
}

function readBootstrapSecret() {
  return readOptionalEnv("ADMIN_BOOTSTRAP_SECRET");
}

function readTokenPepper() {
  return readOptionalEnv("ADMIN_SIGNUP_TOKEN_PEPPER") ?? readBootstrapSecret();
}

async function sha256Hex(value: string) {
  const pepper = readTokenPepper();
  if (!pepper) {
    throw new ConvexError({
      code: "ADMIN_SIGNUP_DISABLED",
      message: "ADMIN_SIGNUP_TOKEN_PEPPER or ADMIN_BOOTSTRAP_SECRET is required.",
    });
  }
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(`${pepper}:${value}`));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function normalizeEmail(value: string) {
  const email = value.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new ConvexError({ code: "INVALID_EMAIL", message: "A valid email is required." });
  }
  return email;
}

function assertBootstrapSecret(secret?: string | null) {
  const expected = readBootstrapSecret();
  if (!expected || !secret || secret !== expected) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_FORBIDDEN", message: "Invalid admin bootstrap secret." });
  }
}

function assertInviteAvailable(invite: any, email: string, now: number) {
  if (!invite || invite.email !== email) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_INVITE_INVALID", message: "Invalid admin signup invite." });
  }
  if (invite.usedAt) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_INVITE_USED", message: "Admin signup invite has already been used." });
  }
  if (invite.revokedAt) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_INVITE_REVOKED", message: "Admin signup invite has been revoked." });
  }
  if (invite.expiresAt <= now) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_INVITE_EXPIRED", message: "Admin signup invite has expired." });
  }
}

async function resolveSignupAuthority(ctx: any, args: {
  email: string;
  token?: string;
  bootstrapSecret?: string;
}) {
  const email = normalizeEmail(args.email);
  const now = Date.now();

  if (args.bootstrapSecret) {
    assertBootstrapSecret(args.bootstrapSecret);
    return {
      email,
      name: undefined as string | undefined,
      level: "owner" as const,
      permissions: ADMIN_OWNER_PERMISSIONS,
      invite: null,
      now,
    };
  }

  if (!args.token) {
    throw new ConvexError({ code: "ADMIN_SIGNUP_INVITE_REQUIRED", message: "Invite token is required." });
  }

  const tokenHash = await sha256Hex(args.token);
  const invite = await ctx.db
    .query("adminSignupInvites")
    .withIndex("tokenHash", (q: any) => q.eq("tokenHash", tokenHash))
    .first();
  assertInviteAvailable(invite, email, now);

  return {
    email,
    name: invite.name as string | undefined,
    level: invite.level as "owner" | "operator" | "support" | "readonly",
    permissions: invite.permissions as AdminPermission[],
    invite,
    now,
  };
}

/**
 * WHY:   Admin signup needs a server-verifiable preflight before Better Auth creates an account.
 * WHAT:  Validates an invite token or bootstrap secret and returns the expected signup identity.
 * HOW:   Hashes invite tokens, checks expiry/revocation/use state, and never mutates rows.
 */
export const validateAdminSignup = mutation({
  args: {
    email: v.string(),
    token: v.optional(v.string()),
    bootstrapSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authority = await resolveSignupAuthority(ctx, args);
    return {
      email: authority.email,
      name: authority.name,
      level: authority.level,
      permissions: authority.permissions,
    };
  },
});

/**
 * WHY:   Admin operators need a controlled way to invite another platform operator.
 * WHAT:  Creates a one-time admin signup invite and returns the raw token once.
 * HOW:   Requires existing admin access, stores only a hash, and records creator audit fields.
 */
export const createAdminSignupInvite = mutation({
  args: {
    email: v.string(),
    name: v.optional(v.string()),
    level: adminAccessLevelValidator,
    permissions: v.array(adminPermissionValidator),
    expiresInHours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const access = await requireAdminAccess(ctx, "admin:users");
    const email = normalizeEmail(args.email);
    const tokenBytes = crypto.getRandomValues(new Uint8Array(32));
    const token = base64UrlEncode(tokenBytes);
    const tokenHash = await sha256Hex(token);
    const now = Date.now();
    const expiresInHours = Math.max(1, Math.min(args.expiresInHours ?? 24, 24 * 14));
    const inviteId = await ctx.db.insert("adminSignupInvites", {
      tokenHash,
      email,
      name: args.name?.trim() || undefined,
      level: args.level,
      permissions: args.permissions.length ? args.permissions : ADMIN_OWNER_PERMISSIONS,
      expiresAt: now + expiresInHours * 60 * 60 * 1000,
      createdByAuthUserId: access.authUserId,
      createdAt: now,
      updatedAt: now,
    });

    return { inviteId, token, email };
  },
});

/**
 * WHY:   The signup bridge must atomically grant platform access after Better Auth creates or links the account.
 * WHAT:  Upserts the matching profile metadata and consumes the invite when present.
 * HOW:   Re-validates the token/secret, keys by email, and keeps the profile business role as `user`.
 */
export const completeAdminSignup = mutation({
  args: {
    email: v.string(),
    authUserId: v.string(),
    name: v.optional(v.string()),
    token: v.optional(v.string()),
    bootstrapSecret: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authority = await resolveSignupAuthority(ctx, args);
    const name = args.name?.trim() || authority.name;
    const adminAccess = buildAdminPlatformAccess({
      level: authority.level,
      permissions: authority.permissions,
      grantedAt: authority.now,
      grantedByAuthUserId: authority.invite?.createdByAuthUserId,
      reason: authority.invite ? "admin_signup_invite" : "admin_bootstrap_signup",
    });
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", authority.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        authUserId: args.authUserId,
        email: authority.email,
        ...(name ? { name } : {}),
        role: "user",
        roleApprovalStatus: "approved",
        requestedRole: undefined,
        metadata: mergeProfileAdminAccessMetadata(existing.metadata, adminAccess),
        isActive: true,
        updatedAt: authority.now,
      });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId: args.authUserId,
        email: authority.email,
        ...(name ? { name } : {}),
        role: "user",
        roleApprovalStatus: "approved",
        metadata: mergeProfileAdminAccessMetadata(undefined, adminAccess),
        isActive: true,
        createdAt: authority.now,
        updatedAt: authority.now,
      });
    }

    if (authority.invite) {
      await ctx.db.patch(authority.invite._id, {
        usedAt: authority.now,
        usedByAuthUserId: args.authUserId,
        updatedAt: authority.now,
      });
    }

    return { email: authority.email, isAdmin: true };
  },
});

/**
 * WHY:   Existing deployments can contain `role: admin` rows that must keep access after the role enum narrows.
 * WHAT:  Converts legacy admin roles to business `user` role plus typed platform metadata.
 * HOW:   Uses the legacy admin fallback in `requireAdminAccess`, patches rows idempotently, and reports counts.
 */
export const backfillLegacyAdminProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    const access = await requireAdminAccess(ctx);
    const profiles = await ctx.db.query("userProfiles").collect();
    let updated = 0;
    const now = Date.now();
    for (const profile of profiles) {
      if ((profile as any).role !== "admin") {
        continue;
      }
      await ctx.db.patch(profile._id, {
        role: "user",
        roleApprovalStatus: "approved",
        metadata: mergeProfileAdminAccessMetadata(
          profile.metadata,
          buildAdminPlatformAccess({
            level: "owner",
            permissions: ADMIN_OWNER_PERMISSIONS,
            grantedAt: now,
            grantedByAuthUserId: access.authUserId,
            reason: "legacy_admin_role_backfill",
          }),
        ),
        isActive: true,
        updatedAt: now,
      });
      updated += 1;
    }
    return { updated };
  },
});

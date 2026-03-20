import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { findProfileForResolvedIdentity, requireResolvedIdentity } from "./identity";

type Ctx = QueryCtx | MutationCtx;

export type ProtectedRole = "admin" | "broker" | "developer" | "user" | "RED";

export type AccessContext = {
  authUserId: string;
  sessionId?: string;
  role: ProtectedRole;
  profile: Doc<"userProfiles"> | null;
  brokerId?: Id<"brokers">;
  REDId?: Id<"RED">;
  roleStatus?: Doc<"userProfiles">["roleStatus"];
};

function normalizeRole(value: unknown): ProtectedRole | null {
  if (value === "RED") return "developer";
  if (
    value === "admin" ||
    value === "broker" ||
    value === "developer" ||
    value === "user"
  ) {
    return value;
  }
  return null;
}

function assertActiveProfile(profile: Doc<"userProfiles"> | null) {
  if (profile?.isActive === false) {
    throw new ConvexError({
      code: "ACCOUNT_INACTIVE",
      message: "Account is deactivated",
    });
  }
}

function resolveEffectiveRole(profile: Doc<"userProfiles"> | null, identityRole?: string): ProtectedRole | null {
  if (profile?.roleStatus === "pending") {
    throw new ConvexError({
      code: "ROLE_PENDING",
      message: "Role is pending approval",
    });
  }
  if (profile?.roleStatus === "rejected") {
    throw new ConvexError({
      code: "ROLE_REJECTED",
      message: "Role request was rejected",
    });
  }
  return normalizeRole(profile?.role ?? identityRole ?? null);
}

function normalizeAllowedRoles(allowedRoles: ProtectedRole[]) {
  return allowedRoles
    .map((role) => normalizeRole(role))
    .filter(Boolean) as ProtectedRole[];
}

function assertAllowedRole(
  role: ProtectedRole | null,
  normalizedAllowed: ProtectedRole[]
): asserts role is ProtectedRole {
  if (!role || !normalizedAllowed.includes(role)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Insufficient role permissions",
    });
  }
}

function assertLinkedRoleEntity(role: ProtectedRole, profile: Doc<"userProfiles"> | null) {
  if (role === "broker" && !profile?.brokerId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Broker profile not linked",
    });
  }
  if (role === "developer" && !profile?.REDId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Developer (RED) profile not linked",
    });
  }
}

/**
 * WHY:   Gives every protected handler a single session-entry check.
 * WHAT:  Resolves the authenticated subject and session token identifier.
 * HOW:   Reads identity from ctx.auth and throws standardized UNAUTHORIZED errors.
 */
export async function requireSession(
  ctx: Ctx,
): Promise<{ authUserId: string; sessionId?: string }> {
  const identity = await requireResolvedIdentity(ctx);
  return {
    authUserId: identity.authUserId,
    sessionId: identity.sessionId,
  };
}

/**
 * WHY:   Centralizes role enforcement on the server for all protected zones.
 * WHAT:  Verifies session + role and returns a typed access context.
 * HOW:   Resolves role from userProfiles first, then optional identity fallback.
 */
export async function requireRole(
  ctx: Ctx,
  allowedRoles: ProtectedRole[],
): Promise<AccessContext> {
  const identity = await requireResolvedIdentity(ctx);
  const profile = await findProfileForResolvedIdentity(ctx, identity);
  assertActiveProfile(profile);
  const role = resolveEffectiveRole(profile, (identity.identity as { role?: string }).role);
  assertAllowedRole(role, normalizeAllowedRoles(allowedRoles));
  assertLinkedRoleEntity(role, profile);

  return {
    authUserId: identity.authUserId,
    sessionId: identity.sessionId,
    role,
    profile,
    brokerId: profile?.brokerId,
    REDId: profile?.REDId,
    roleStatus: profile?.roleStatus,
  };
}

/**
 * WHY:   Keeps publish-time verification checks consistent across zones.
 * WHAT:  Validates a role and enforces verified broker/RED organization status.
 * HOW:   Builds on requireRole then loads the linked organization document.
 */
export async function requireVerifiedRole(
  ctx: Ctx,
  role: "broker" | "developer" | "RED",
): Promise<AccessContext> {
  const normalizedRole = role === "RED" ? "developer" : role;
  const access = await requireRole(ctx, [normalizedRole]);

  if (normalizedRole === "broker") {
    const broker = await ctx.db.get(access.brokerId!);
    if (!broker?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "Broker verification is required for this operation",
      });
    }
  } else {
    const red = await ctx.db.get(access.REDId!);
    if (!red?.isVerified) {
      throw new ConvexError({
        code: "VERIFICATION_REQUIRED",
        message: "RED verification is required for this operation",
      });
    }
  }

  return access;
}

/**
 * WHY:   Provides zone-scoped role enforcement without repeating role lists.
 * WHAT:  Maps a zone name to its allowed roles and delegates to requireRole.
 * HOW:   Keeps zone gate logic centralized for future role additions.
 */
export async function requireZoneRole(
  ctx: Ctx,
  zone:
    | "admin_zone"
    | "broker_zone"
    | "red_zone"
    | "user_zone"
    | "shared_logic"
    | "ai_zone",
): Promise<AccessContext> {
  const zoneRoles: Record<typeof zone, ProtectedRole[]> = {
    admin_zone: ["admin"],
    broker_zone: ["broker"],
    red_zone: ["developer"],
    user_zone: ["user", "broker", "developer", "admin"],
    shared_logic: ["admin", "broker", "developer", "user"],
    ai_zone: ["admin", "broker", "developer", "user"],
  } as const;

  return requireRole(ctx, zoneRoles[zone]);
}

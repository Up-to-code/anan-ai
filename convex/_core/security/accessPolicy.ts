import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import { findProfileForResolvedIdentity, requireResolvedIdentity } from "./identity";
import {
  getAdminPlatformAccess,
  profileHasAdminAccess,
  type AdminPermission,
  type AdminPlatformAccess,
} from "./adminAccess";
import {
  normalizeUserProfileRoleState,
  type UserRole,
} from "./profileRoles";

type Ctx = QueryCtx | MutationCtx;

export type ProtectedRole = UserRole;

export type AccessContext = {
  authUserId: string;
  sessionId?: string;
  role: ProtectedRole;
  profile: Doc<"userProfiles"> | null;
  brokerId?: Id<"brokers">;
  developerId?: Id<"RED">;
  REDId?: Id<"RED">;
  roleApprovalStatus?: Doc<"userProfiles">["roleApprovalStatus"];
};

export type AdminAccessContext = {
  authUserId: string;
  sessionId?: string;
  role: "admin";
  profile: Doc<"userProfiles"> | null;
  adminAccess: AdminPlatformAccess;
};

function normalizeRole(value: unknown): ProtectedRole | null {
  if (
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
  const normalizedProfile = profile ? normalizeUserProfileRoleState(profile) : null;
  if (normalizedProfile?.roleApprovalStatus === "pending") {
    throw new ConvexError({
      code: "ROLE_PENDING",
      message: "Role is pending approval",
    });
  }
  if (normalizedProfile?.roleApprovalStatus === "rejected") {
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

async function resolveLinkedRoleEntity(
  ctx: Ctx,
  role: ProtectedRole,
  profile: Doc<"userProfiles"> | null,
) {
  const normalizedProfile = profile ? normalizeUserProfileRoleState(profile) : null;

  if (role === "broker" && profile?.brokerId) {
    return {
      brokerId: profile.brokerId,
      developerId: undefined,
    } as const;
  }

  if (role === "developer" && normalizedProfile?.developerId) {
    return {
      brokerId: undefined,
      developerId: normalizedProfile.developerId,
    } as const;
  }

  if (!profile?.currentTenantOrgId) {
    return {
      brokerId: undefined,
      developerId: undefined,
    } as const;
  }

  const link = await ctx.db
    .query("tenantOrgLinks")
    .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", profile.currentTenantOrgId!))
    .first();

  if (!link) {
    return {
      brokerId: undefined,
      developerId: undefined,
    } as const;
  }

  if (role === "broker" && link.ownerType === "broker" && link.ownerBrokerId) {
    return {
      brokerId: link.ownerBrokerId,
      developerId: undefined,
    } as const;
  }

  if (role === "developer" && link.ownerType === "RED" && link.ownerREDId) {
    return {
      brokerId: undefined,
      developerId: link.ownerREDId,
    } as const;
  }

  return {
    brokerId: undefined,
    developerId: undefined,
  } as const;
}

function assertLinkedRoleEntity(
  role: ProtectedRole,
  linkedRoleEntity: { brokerId?: Id<"brokers">; developerId?: Id<"RED"> },
) {
  if (role === "broker" && !linkedRoleEntity.brokerId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Broker profile not linked",
    });
  }
  if (role === "developer" && !linkedRoleEntity.developerId) {
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
  const normalizedProfile = profile ? normalizeUserProfileRoleState(profile) : null;
  assertActiveProfile(profile);
  const role = resolveEffectiveRole(profile, (identity.identity as { role?: string }).role);
  assertAllowedRole(role, normalizeAllowedRoles(allowedRoles));
  const linkedRoleEntity = await resolveLinkedRoleEntity(ctx, role, profile);
  assertLinkedRoleEntity(role, linkedRoleEntity);

  return {
    authUserId: identity.authUserId,
    sessionId: identity.sessionId,
    role,
    profile,
    brokerId: linkedRoleEntity.brokerId,
    developerId: linkedRoleEntity.developerId,
    REDId: linkedRoleEntity.developerId,
    roleApprovalStatus: normalizedProfile?.roleApprovalStatus,
  };
}

/**
 * WHY:   Platform control-plane access must be separate from marketplace business roles.
 * WHAT:  Verifies authenticated admin metadata and returns a platform admin access context.
 * HOW:   Reads `userProfiles.metadata.platformAccess.admin`, with a legacy `role: admin` fallback during migration only.
 */
export async function requireAdminAccess(
  ctx: Ctx,
  permission?: AdminPermission,
): Promise<AdminAccessContext> {
  const identity = await requireResolvedIdentity(ctx);
  const profile = await findProfileForResolvedIdentity(ctx, identity);
  assertActiveProfile(profile);
  if (!profileHasAdminAccess(profile, permission)) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  const adminAccess = getAdminPlatformAccess(profile);
  if (!adminAccess) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }

  return {
    authUserId: identity.authUserId,
    sessionId: identity.sessionId,
    role: "admin",
    profile,
    adminAccess,
  };
}

/**
 * WHY:   Keeps publish-time verification checks consistent across zones.
 * WHAT:  Validates a role and enforces verified broker/RED organization status.
 * HOW:   Builds on requireRole then loads the linked organization document.
 */
export async function requireVerifiedRole(
  ctx: Ctx,
  role: "broker" | "developer",
): Promise<AccessContext> {
  const normalizedRole = role;
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
    const red = await ctx.db.get(access.developerId!);
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
): Promise<AccessContext | AdminAccessContext> {
  if (zone === "admin_zone") {
    return requireAdminAccess(ctx);
  }
  const zoneRoles: Record<
    Exclude<typeof zone, "admin_zone">,
    ProtectedRole[]
  > = {
    broker_zone: ["broker"],
    red_zone: ["developer"],
    user_zone: ["user", "broker", "developer"],
    shared_logic: ["broker", "developer", "user"],
    ai_zone: ["broker", "developer", "user"],
  } as const;

  return requireRole(ctx, zoneRoles[zone]);
}

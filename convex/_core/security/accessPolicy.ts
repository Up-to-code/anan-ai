import { ConvexError } from "convex/values";
import {
  authContextFromClaims,
  requireEntitlement as requireSharedEntitlement,
  type AuthContext,
} from "@anan/auth/server";
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
export type WorkspaceEntitlement =
  | "workspace:user"
  | "workspace:broker"
  | "workspace:developer";

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

function entitlementForRole(role: ProtectedRole): WorkspaceEntitlement {
  return `workspace:${role}` as WorkspaceEntitlement;
}

function roleForEntitlement(entitlement: WorkspaceEntitlement): ProtectedRole {
  return entitlement.replace("workspace:", "") as ProtectedRole;
}

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

function createAuthContextForAccess(params: {
  identity: Awaited<ReturnType<typeof requireResolvedIdentity>>;
  profile: Doc<"userProfiles"> | null;
  role: ProtectedRole;
  linkedRoleEntity: { brokerId?: Id<"brokers">; developerId?: Id<"RED"> };
}): AuthContext {
  const { identity, profile, role, linkedRoleEntity } = params;
  const identityClaims = identity.identity as Record<string, unknown> & {
    entitlements?: string[];
  };
  return authContextFromClaims({
    ...identityClaims,
    sub: identity.authUserId,
    email: identity.email,
    name: identity.name,
    role,
    broker_id: linkedRoleEntity.brokerId,
    red_id: linkedRoleEntity.developerId,
    org_id: profile?.currentTenantOrgId,
    entitlements: [
      entitlementForRole(role),
      ...(Array.isArray(identityClaims.entitlements) ? identityClaims.entitlements : []),
    ],
  });
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
 * WHY:   Centralizes entitlement enforcement on the server for all protected zones.
 * WHAT:  Verifies session + OIDC-style entitlements and returns a typed access context.
 * HOW:   Resolves business ownership from profiles, projects it to AuthContext, then applies shared guards.
 */
export async function requireEntitlements(
  ctx: Ctx,
  entitlements: WorkspaceEntitlement[],
): Promise<AccessContext> {
  const identity = await requireResolvedIdentity(ctx);
  const profile = await findProfileForResolvedIdentity(ctx, identity);
  const normalizedProfile = profile ? normalizeUserProfileRoleState(profile) : null;
  assertActiveProfile(profile);
  const role = resolveEffectiveRole(profile, (identity.identity as { role?: string }).role);
  const allowedRoles = entitlements.map(roleForEntitlement);
  assertAllowedRole(role, normalizeAllowedRoles(allowedRoles));
  const linkedRoleEntity = await resolveLinkedRoleEntity(ctx, role, profile);
  assertLinkedRoleEntity(role, linkedRoleEntity);
  const authContext = createAuthContextForAccess({
    identity,
    profile,
    role,
    linkedRoleEntity,
  });
  requireSharedEntitlement(authContext, entitlementForRole(role));

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
 * @deprecated Use requireEntitlements(ctx, ["workspace:broker"]) or a narrower ownership helper.
 */
export async function requireRole(
  ctx: Ctx,
  allowedRoles: ProtectedRole[],
): Promise<AccessContext> {
  return requireEntitlements(ctx, allowedRoles.map(entitlementForRole));
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
 * WHAT:  Validates an entitlement and enforces verified broker/RED organization status.
 * HOW:   Builds on requireEntitlements then loads the linked organization document.
 */
export async function requireVerifiedRole(
  ctx: Ctx,
  role: "broker" | "developer",
): Promise<AccessContext> {
  const normalizedRole = role;
  const access = await requireEntitlements(ctx, [entitlementForRole(normalizedRole)]);

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
 * WHAT:  Maps a zone name to its required entitlements and delegates to requireEntitlements.
 * HOW:   Keeps zone gate logic centralized for future role additions.
 */
export async function requireZoneRole(
  ctx: Ctx,
  zone:
    | "admin_zone"
    | "broker_zone"
    | "red_zone"
    | "shared_logic"
    | "ai_zone",
): Promise<AccessContext | AdminAccessContext> {
  if (zone === "admin_zone") {
    return requireAdminAccess(ctx);
  }
  const zoneEntitlements: Record<
    Exclude<typeof zone, "admin_zone">,
    WorkspaceEntitlement[]
  > = {
    broker_zone: ["workspace:broker"],
    red_zone: ["workspace:developer"],
    shared_logic: ["workspace:broker", "workspace:developer", "workspace:user"],
    ai_zone: ["workspace:broker", "workspace:developer", "workspace:user"],
  } as const;

  return requireEntitlements(ctx, zoneEntitlements[zone]);
}

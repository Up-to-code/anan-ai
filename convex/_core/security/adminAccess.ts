import { v } from "convex/values";
import type { Doc } from "../../_generated/dataModel";

export const adminAccessLevelValidator = v.union(
  v.literal("owner"),
  v.literal("operator"),
  v.literal("support"),
  v.literal("readonly"),
);

export const adminPermissionValidator = v.union(
  v.literal("admin:*"),
  v.literal("admin:analytics"),
  v.literal("admin:content"),
  v.literal("admin:integrations"),
  v.literal("admin:projects"),
  v.literal("admin:system"),
  v.literal("admin:users"),
  v.literal("admin:verifications"),
);

export const adminPlatformAccessValidator = v.object({
  enabled: v.boolean(),
  level: adminAccessLevelValidator,
  permissions: v.array(adminPermissionValidator),
  grantedAt: v.number(),
  grantedByAuthUserId: v.optional(v.string()),
  revokedAt: v.optional(v.number()),
  reason: v.optional(v.string()),
});

export const profileMetadataValidator = v.object({
  platformAccess: v.optional(
    v.object({
      admin: v.optional(adminPlatformAccessValidator),
    }),
  ),
});

export type AdminAccessLevel = "owner" | "operator" | "support" | "readonly";
export type AdminPermission =
  | "admin:*"
  | "admin:analytics"
  | "admin:content"
  | "admin:integrations"
  | "admin:projects"
  | "admin:system"
  | "admin:users"
  | "admin:verifications";

export type AdminPlatformAccess = {
  enabled: boolean;
  level: AdminAccessLevel;
  permissions: AdminPermission[];
  grantedAt: number;
  grantedByAuthUserId?: string;
  revokedAt?: number;
  reason?: string;
};

export const ADMIN_OWNER_PERMISSIONS: AdminPermission[] = ["admin:*"];

type ProfileWithMetadata = Partial<Doc<"userProfiles">> & {
  role?: unknown;
  metadata?: {
    platformAccess?: {
      admin?: Partial<AdminPlatformAccess> | null;
    };
  } | null;
};

export function normalizeAdminPermission(value: unknown): AdminPermission | null {
  const permissions: readonly AdminPermission[] = [
    "admin:*",
    "admin:analytics",
    "admin:content",
    "admin:integrations",
    "admin:projects",
    "admin:system",
    "admin:users",
    "admin:verifications",
  ];
  return permissions.includes(value as AdminPermission) ? (value as AdminPermission) : null;
}

export function buildAdminPlatformAccess(args: {
  level?: AdminAccessLevel;
  permissions?: AdminPermission[];
  grantedAt?: number;
  grantedByAuthUserId?: string;
  reason?: string;
}): AdminPlatformAccess {
  return {
    enabled: true,
    level: args.level ?? "owner",
    permissions: args.permissions?.length ? args.permissions : ADMIN_OWNER_PERMISSIONS,
    grantedAt: args.grantedAt ?? Date.now(),
    ...(args.grantedByAuthUserId ? { grantedByAuthUserId: args.grantedByAuthUserId } : {}),
    ...(args.reason ? { reason: args.reason } : {}),
  };
}

export function mergeProfileAdminAccessMetadata(
  metadata: ProfileWithMetadata["metadata"] | undefined,
  admin: AdminPlatformAccess,
) {
  return {
    ...(metadata ?? {}),
    platformAccess: {
      ...(metadata?.platformAccess ?? {}),
      admin,
    },
  };
}

export function getAdminPlatformAccess(profile: ProfileWithMetadata | null | undefined): AdminPlatformAccess | null {
  const admin = profile?.metadata?.platformAccess?.admin;
  if (admin?.enabled && !admin.revokedAt && admin.level && admin.permissions?.length) {
    return admin as AdminPlatformAccess;
  }

  if ((profile as { role?: unknown } | null | undefined)?.role === "admin") {
    return buildAdminPlatformAccess({
      level: "owner",
      permissions: ADMIN_OWNER_PERMISSIONS,
      grantedAt: 0,
      reason: "legacy_admin_role",
    });
  }

  return null;
}

export function profileHasAdminAccess(
  profile: ProfileWithMetadata | null | undefined,
  permission?: AdminPermission,
) {
  const access = getAdminPlatformAccess(profile);
  if (!access) {
    return false;
  }
  if (!permission) {
    return true;
  }
  return access.permissions.includes("admin:*") || access.permissions.includes(permission);
}

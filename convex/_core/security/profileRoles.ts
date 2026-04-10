import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";

export const userRoleValidator = v.union(
  v.literal("admin"),
  v.literal("broker"),
  v.literal("developer"),
  v.literal("user"),
);

export const userRoleApprovalStatusValidator = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("rejected"),
);

export type UserRole = "admin" | "broker" | "developer" | "user";
export type UserRoleApprovalStatus = "pending" | "approved" | "rejected";

type ProfileRoleStateShape = {
  role?: unknown;
  requestedRole?: unknown;
  roleApprovalStatus?: unknown;
  roleStatus?: unknown;
  brokerId?: Id<"brokers">;
  developerId?: Id<"RED">;
  REDId?: Id<"RED">;
};

export function normalizeUserRole(value: unknown): UserRole | undefined {
  if (value === "RED") return "developer";
  if (value === "admin" || value === "broker" || value === "developer" || value === "user") {
    return value;
  }
  return undefined;
}

export function normalizeUserRoleApprovalStatus(
  value: unknown,
): UserRoleApprovalStatus | undefined {
  if (value === "pending" || value === "approved" || value === "rejected") {
    return value;
  }
  return undefined;
}

/**
 * WHY:   Dashboard-edited profiles need one canonical role shape before auth and admin flows read them.
 * WHAT:  Normalizes legacy/partial profile role fields into the current flat schema.
 * HOW:   Maps RED→developer, chooses canonical approval status, removes stale requested roles, and
 *        keeps only the organization link that matches the active role.
 */
export function normalizeUserProfileRoleState(profile: ProfileRoleStateShape) {
  const role = normalizeUserRole(profile.role) ?? "user";
  const requestedRole = normalizeUserRole(profile.requestedRole);
  const roleApprovalStatus =
    normalizeUserRoleApprovalStatus(
      profile.roleApprovalStatus ?? profile.roleStatus,
    ) ?? "approved";

  const brokerId = role === "broker" ? profile.brokerId : undefined;
  const developerId =
    role === "developer" ? (profile.developerId ?? profile.REDId) : undefined;

  return {
    role,
    requestedRole: requestedRole === role ? undefined : requestedRole,
    roleApprovalStatus,
    brokerId,
    developerId,
  } as const;
}

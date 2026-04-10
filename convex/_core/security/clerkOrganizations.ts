import { ConvexError } from "convex/values";

type Identity = Record<string, unknown> & {
  subject?: string | null;
  tokenIdentifier?: string | null;
};

type Ctx = {
  auth: {
    getUserIdentity: () => Promise<Identity | null>;
  };
};

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function readStringArray(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string" && entry.trim().length > 0)
    : [];
}

/**
 * WHY:   Clerk Organizations are now the runtime tenant boundary for the workspace.
 * WHAT:  Reads the active organization id, slug, role, and permissions from Convex identity claims.
 * HOW:   Supports both Clerk-style snake_case claims and camelCase fallbacks so the helper remains stable
 *        across JWT template changes during the migration.
 */
export async function getClerkOrganizationContext(ctx: Ctx): Promise<{
  organizationId: string | null;
  organizationSlug: string | null;
  organizationRole: string | null;
  organizationPermissions: string[];
} | null> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }

  return {
    organizationId: readString(identity.org_id ?? identity.orgId ?? identity.organizationId),
    organizationSlug: readString(identity.org_slug ?? identity.orgSlug ?? identity.organizationSlug),
    organizationRole: readString(identity.org_role ?? identity.orgRole ?? identity.organizationRole),
    organizationPermissions: readStringArray(
      identity.org_permissions ?? identity.orgPermissions ?? identity.organizationPermissions,
    ),
  };
}

/**
 * WHY:   Org-scoped workspace functions should fail consistently when the caller has no active org context.
 * WHAT:  Returns the current Clerk organization context or throws a standardized forbidden error.
 * HOW:   Delegates to `getClerkOrganizationContext` and enforces an `organizationId`.
 */
export async function requireClerkOrganizationContext(ctx: Ctx) {
  const organization = await getClerkOrganizationContext(ctx);
  if (!organization?.organizationId) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Active organization required",
    });
  }
  return {
    ...organization,
    organizationId: organization.organizationId,
  };
}

/**
 * WHY:   Internal org workspace records should only be reachable when the active org grants the matching permission.
 * WHAT:  Checks the current org permissions/role for the requested capability.
 * HOW:   Allows either the explicit Clerk custom permission or a high-privilege org role such as owner/admin.
 */
export async function requireClerkOrganizationPermission(
  ctx: Ctx,
  permission: string,
) {
  const organization = await requireClerkOrganizationContext(ctx);
  const normalizedRole = (organization.organizationRole ?? "").toLowerCase();
  const hasElevatedRole =
    normalizedRole.includes("owner") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("manager");
  const hasPermission = organization.organizationPermissions.includes(permission);

  if (!hasElevatedRole && !hasPermission) {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Organization permission required: ${permission}`,
    });
  }

  return organization;
}

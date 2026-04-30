import { ConvexError } from "convex/values";
import {
  authContextFromClaims,
  requireScopes,
} from "@anan/auth/server";

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
 * WHY:   Auth provider organizations are the runtime tenant boundary for the workspace.
 * WHAT:  Reads the active organization id, slug, role, and permissions from Convex identity claims.
 * HOW:   Supports snake_case and camelCase fallbacks so the helper remains stable across provider JWT changes.
 */
export async function getAuthOrganizationContext(ctx: Ctx): Promise<{
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
 * WHAT:  Returns the current auth organization context or throws a standardized forbidden error.
 * HOW:   Delegates to `getAuthOrganizationContext` and enforces an `organizationId`.
 */
export async function requireAuthOrganizationContext(ctx: Ctx) {
  const organization = await getAuthOrganizationContext(ctx);
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
 * WHY:   Internal org workspace records should only be reachable when the active org grants matching scopes.
 * WHAT:  Checks the current org permissions/role for the requested capability.
 * HOW:   Projects Convex identity claims into AuthContext and delegates scope checks to `@anan/auth`.
 */
export async function requireOrganizationScopes(
  ctx: Ctx,
  scopes: string[],
) {
  const organization = await requireAuthOrganizationContext(ctx);
  const identity = await ctx.auth.getUserIdentity();
  const normalizedRole = (organization.organizationRole ?? "").toLowerCase();
  const hasElevatedRole =
    normalizedRole.includes("owner") ||
    normalizedRole.includes("admin") ||
    normalizedRole.includes("manager");
  const authContext = authContextFromClaims({
    ...(identity ?? {}),
    sub: identity?.subject ?? undefined,
    scope: organization.organizationPermissions,
    org_id: organization.organizationId,
    org_slug: organization.organizationSlug,
    org_role: organization.organizationRole,
    org_permissions: organization.organizationPermissions,
  });

  try {
    requireScopes(authContext, scopes);
  } catch (error) {
    if (hasElevatedRole) {
      return organization;
    }
    throw new ConvexError({
      code: "FORBIDDEN",
      message: `Organization scope required: ${scopes.join(", ")}`,
    });
  }

  return organization;
}

/**
 * @deprecated Use requireOrganizationScopes(ctx, ["clients:read"]).
 */
export async function requireAuthOrganizationPermission(
  ctx: Ctx,
  permission: string,
) {
  return requireOrganizationScopes(ctx, [permission]);
}

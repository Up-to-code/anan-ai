import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { requireSession } from "../_core/security/accessPolicy";
import {
  requireAuthOrganizationContext,
  requireAuthOrganizationPermission,
} from "../_core/security/authOrganizations";
import { findProfileByAuthUserId } from "./agencies/repositories/core";
import { tenants } from "../tenants";
import { auditLog } from "../auditLog";

const organizationTypeValidator = v.union(v.literal("broker"), v.literal("red"));

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function ensureUniqueOrganizationSlug(
  ctx: any,
  table: "brokers" | "RED",
  baseSlug: string,
) {
  const safeBase = baseSlug || `organization-${crypto.randomUUID().slice(0, 8)}`;

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? safeBase : `${safeBase}-${index + 1}`;
    const existing = await ctx.db
      .query(table)
      .withIndex("slug", (q: any) => q.eq("slug", candidate))
      .first();
    if (!existing) return candidate;
  }

  return `${safeBase}-${crypto.randomUUID().slice(0, 6)}`;
}

async function getOrganizationProfileByOrganizationId(ctx: any, organizationId: string) {
  return ctx.db
    .query("organizationProfiles")
    .withIndex("organizationId", (q: any) => q.eq("organizationId", organizationId))
    .first();
}

function mapOrganizationProfile(doc: any | null) {
  if (!doc) {
    return null;
  }

  return {
    id: doc.organizationId,
    organizationId: doc.organizationId,
    type: doc.type,
    name: doc.name,
    slug: doc.slug,
    status: doc.status ?? "active",
    isVerified: doc.isVerified === true,
    logoUrl: doc.logoUrl ?? null,
    description: doc.description,
    website: doc.website,
    contactEmail: doc.contactEmail,
    phone: doc.phone,
    legacyTenantOrgId: doc.legacyTenantOrgId ?? null,
    legacyOwnerType: doc.legacyOwnerType ?? null,
    legacyOwnerId:
      doc.legacyOwnerType === "broker"
        ? (doc.legacyOwnerBrokerId ? String(doc.legacyOwnerBrokerId) : null)
        : (doc.legacyOwnerREDId ? String(doc.legacyOwnerREDId) : null),
  };
}

async function patchCurrentProfileTenantOrg(ctx: any, args: {
  authUserId: string;
  tenantOrgId?: string | null;
  type: "broker" | "red";
}) {
  if (!args.tenantOrgId) {
    return null;
  }

  const profile = await findProfileByAuthUserId(ctx, args.authUserId);
  if (!profile) {
    return null;
  }

  const role = args.type === "red" ? "developer" : "broker";

  await ctx.db.patch(profile._id, {
    currentTenantOrgId: args.tenantOrgId,
    role,
    requestedRole: role,
    roleApprovalStatus: "approved",
    isActive: true,
    updatedAt: Date.now(),
  });

  return ctx.db.get(profile._id);
}

async function createLegacyOrganizationBridge(ctx: any, args: {
  authUserId: string;
  email?: string | null;
  displayName?: string | null;
  name: string;
  type: "broker" | "red";
}) {
  const normalizedName = args.name.trim().replace(/\s+/g, " ");
  if (!normalizedName || normalizedName.length < 2) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Organization name must be at least 2 characters",
    });
  }

  const baseSlug = slugifyOrganizationName(normalizedName);
  const now = Date.now();

  if (args.type === "broker") {
    const slug = await ensureUniqueOrganizationSlug(ctx, "brokers", baseSlug);
    const brokerId = await ctx.db.insert("brokers", {
      name: normalizedName,
      slug,
      status: "active",
      isVerified: false,
      contactEmail: args.email ?? undefined,
    });

    const tenantOrgId = await tenants.createOrganization(ctx as never, args.authUserId, normalizedName, {
      slug,
      metadata: {
        ownerType: "broker",
        ownerBrokerId: String(brokerId),
      },
    });

    await ctx.db.insert("tenantOrgLinks", {
      tenantOrgId,
      ownerType: "broker",
      ownerBrokerId: brokerId,
      createdAt: now,
      updatedAt: now,
    });

    return {
      legacyTenantOrgId: tenantOrgId,
      legacyOwnerType: "broker" as const,
      legacyOwnerBrokerId: brokerId,
      legacyOwnerREDId: undefined,
      slug,
    };
  }

  const slug = await ensureUniqueOrganizationSlug(ctx, "RED", baseSlug);
  const redId = await ctx.db.insert("RED", {
    name: normalizedName,
    slug,
    status: "active",
    isVerified: false,
    contactEmail: args.email ?? undefined,
  });

  const tenantOrgId = await tenants.createOrganization(ctx as never, args.authUserId, normalizedName, {
    slug,
    metadata: {
      ownerType: "RED",
      ownerREDId: String(redId),
    },
  });

  await ctx.db.insert("tenantOrgLinks", {
    tenantOrgId,
    ownerType: "RED",
    ownerREDId: redId,
    createdAt: now,
    updatedAt: now,
  });

  return {
    legacyTenantOrgId: tenantOrgId,
    legacyOwnerType: "RED" as const,
    legacyOwnerBrokerId: undefined,
    legacyOwnerREDId: redId,
    slug,
  };
}

/**
 * WHY:   Web services need to hydrate Better Auth organization memberships with app-owned metadata in one round-trip.
 * WHAT:  Lists local organization profile records by Better Auth organization ids.
 * HOW:   Filters the indexed `organizationProfiles` table and returns the normalized DTO shape used by the web gateway.
 */
export const listOrganizationProfilesByIds = query({
  args: {
    organizationIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await requireSession(ctx);
    const uniqueIds = Array.from(new Set(args.organizationIds.filter(Boolean)));
    const rows = await Promise.all(
      uniqueIds.map((organizationId) => getOrganizationProfileByOrganizationId(ctx, organizationId)),
    );
    return rows.map(mapOrganizationProfile).filter(Boolean);
  },
});

/**
 * WHY:   Workspace bootstrapping needs the app-owned metadata for the currently active Better Auth organization.
 * WHAT:  Returns the current organization's local profile bridge.
 * HOW:   Resolves the active Better Auth organization id from Convex auth claims and loads the mapped profile by index.
 */
export const getCurrentOrganizationProfile = query({
  args: {},
  handler: async (ctx) => {
    const organization = await requireAuthOrganizationContext(ctx);
    return mapOrganizationProfile(
      await getOrganizationProfileByOrganizationId(ctx, organization.organizationId),
    );
  },
});

/**
 * WHY:   New Better Auth organizations still need a local metadata row and a compatibility bridge while business zones migrate.
 * WHAT:  Creates or updates the current active organization's local profile bridge and syncs the caller's active tenant link.
 * HOW:   Uses the active Better Auth org claim, creates legacy owner/link records when missing, then upserts the local profile row.
 */
export const bootstrapCurrentOrganizationProfile = mutation({
  args: {
    organizationId: v.string(),
    name: v.string(),
    slug: v.optional(v.string()),
    type: organizationTypeValidator,
  },
  handler: async (ctx, args) => {
    const actor = await requireSession(ctx);
    const activeOrganization = await requireAuthOrganizationContext(ctx);

    if (activeOrganization.organizationId !== args.organizationId) {
      throw new ConvexError({
        code: "FORBIDDEN",
        message: "Active organization mismatch",
      });
    }

    const profile = await findProfileByAuthUserId(ctx, actor.authUserId);
    const existing = await getOrganizationProfileByOrganizationId(ctx, args.organizationId);

    let nextValues = {
      slug: args.slug?.trim() || slugifyOrganizationName(args.name),
      legacyTenantOrgId: existing?.legacyTenantOrgId,
      legacyOwnerType: existing?.legacyOwnerType,
      legacyOwnerBrokerId: existing?.legacyOwnerBrokerId,
      legacyOwnerREDId: existing?.legacyOwnerREDId,
    };

    if (!existing?.legacyTenantOrgId) {
      const bridge = await createLegacyOrganizationBridge(ctx, {
        authUserId: actor.authUserId,
        email: profile?.email ?? null,
        displayName: profile?.name ?? null,
        name: args.name,
        type: args.type,
      });
      nextValues = {
        slug: args.slug?.trim() || bridge.slug,
        legacyTenantOrgId: bridge.legacyTenantOrgId,
        legacyOwnerType: bridge.legacyOwnerType,
        legacyOwnerBrokerId: bridge.legacyOwnerBrokerId,
        legacyOwnerREDId: bridge.legacyOwnerREDId,
      };
    }

    await patchCurrentProfileTenantOrg(ctx, {
      authUserId: actor.authUserId,
      tenantOrgId: nextValues.legacyTenantOrgId,
      type: args.type,
    });

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, {
        name: args.name.trim(),
        slug: nextValues.slug,
        type: args.type,
        legacyTenantOrgId: nextValues.legacyTenantOrgId,
        legacyOwnerType: nextValues.legacyOwnerType,
        legacyOwnerBrokerId: nextValues.legacyOwnerBrokerId,
        legacyOwnerREDId: nextValues.legacyOwnerREDId,
        updatedAt: now,
      });
      const updated = await ctx.db.get(existing._id);
      return mapOrganizationProfile(updated);
    }

    const insertedId = await ctx.db.insert("organizationProfiles", {
      organizationId: args.organizationId,
      name: args.name.trim(),
      slug: nextValues.slug,
      type: args.type,
      status: "active",
      isVerified: false,
      legacyTenantOrgId: nextValues.legacyTenantOrgId,
      legacyOwnerType: nextValues.legacyOwnerType,
      legacyOwnerBrokerId: nextValues.legacyOwnerBrokerId,
      legacyOwnerREDId: nextValues.legacyOwnerREDId,
      createdByUserId: actor.authUserId,
      createdAt: now,
      updatedAt: now,
    });
    const inserted = await ctx.db.get(insertedId);

    await auditLog.log(ctx, {
      action: "organization_profile.bootstrapped",
      actorId: actor.authUserId,
      resourceType: "organizationProfiles",
      resourceId: String(insertedId),
      severity: "info",
      metadata: {
        organizationId: args.organizationId,
        legacyTenantOrgId: nextValues.legacyTenantOrgId,
        type: args.type,
      },
      tags: ["organizations", "better-auth", "bootstrap"],
    });

    return mapOrganizationProfile(inserted);
  },
});

/**
 * WHY:   Switching the active Better Auth organization should immediately sync the local workspace owner bridge.
 * WHAT:  Rebinds the current profile to the active organization's legacy tenant mapping when available.
 * HOW:   Resolves the active Better Auth org claim, loads the bridge row, and patches `currentTenantOrgId` on the caller's profile.
 */
export const syncCurrentOrganizationProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const actor = await requireSession(ctx);
    const organization = await requireAuthOrganizationContext(ctx);
    const profile = await getOrganizationProfileByOrganizationId(ctx, organization.organizationId);
    if (!profile) {
      return null;
    }

    await patchCurrentProfileTenantOrg(ctx, {
      authUserId: actor.authUserId,
      tenantOrgId: profile.legacyTenantOrgId,
      type: profile.type,
    });

    return mapOrganizationProfile(profile);
  },
});

/**
 * WHY:   Organization settings must update app-owned org metadata without exposing internal bridge tables to the client.
 * WHAT:  Updates editable fields on the current active organization profile.
 * HOW:   Requires the workspace-manage org permission (or elevated org role), then patches the active org metadata row.
 */
export const updateCurrentOrganizationProfile = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
    phone: v.optional(v.string()),
    logoUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const actor = await requireSession(ctx);
    const organization = await requireAuthOrganizationPermission(ctx, "org:workspace:manage");
    const existing = await getOrganizationProfileByOrganizationId(ctx, organization.organizationId);

    if (!existing) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Organization profile not found",
      });
    }

    const now = Date.now();
    await ctx.db.patch(existing._id, {
      name: args.name.trim(),
      description: args.description,
      website: args.website,
      contactEmail: args.contactEmail,
      phone: args.phone,
      logoUrl: args.logoUrl,
      updatedAt: now,
    });
    const updated = await ctx.db.get(existing._id);

    await auditLog.log(ctx, {
      action: "organization_profile.updated",
      actorId: actor.authUserId,
      resourceType: "organizationProfiles",
      resourceId: String(existing._id),
      severity: "info",
      metadata: {
        organizationId: organization.organizationId,
      },
      tags: ["organizations", "better-auth", "settings"],
    });

    return mapOrganizationProfile(updated);
  },
});

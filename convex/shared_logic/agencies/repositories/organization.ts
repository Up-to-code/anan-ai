import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import type { MutationCtx } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import { auditLog } from "../../../auditLog";
import { requireSession } from "../../../_core/security/accessPolicy";
import {
  findProfileByAuthUserId,
  findTenantOrgLinkByTenantOrgId,
  buildOwnerContextFromProfile,
  getOwnerId,
  getOrganizationRecord,
  normalizeEmail,
  resolveOwnerContextFromProfile,
  type AgenciesRepositoryCtx,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { requireManagerAccess, requireOrganizationMembership } from "./membership";
import { tenants } from "../../../tenants";

async function listOrganizationsForProfile(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  const tenantOrgs = await tenants.listOrganizations(ctx as never, profile.authUserId);
  const organizations = await Promise.all(
    tenantOrgs.map(async (org) => {
      const link = await findTenantOrgLinkByTenantOrgId(ctx, org._id);
      if (!link) {
        return null;
      }
      const ownerType = link.ownerType === "broker" ? "broker" as const : "red" as const;
      const ownerRecord =
        link.ownerType === "broker"
          ? await ctx.db.get(link.ownerBrokerId!)
          : await ctx.db.get(link.ownerREDId!);
      return {
        id: String(link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId),
        type: ownerType,
        name: ownerRecord?.name ?? org.name,
        slug: ownerRecord?.slug ?? org.slug,
        status: (ownerRecord as any)?.status ?? null,
        isVerified: (ownerRecord as any)?.isVerified === true,
        description: (ownerRecord as any)?.description,
        website: (ownerRecord as any)?.website,
        contactEmail: (ownerRecord as any)?.contactEmail,
      };
    }),
  );

  const hydratedOrganizations = organizations.filter((org): org is NonNullable<typeof org> => Boolean(org));
  if (hydratedOrganizations.length > 0) {
    return hydratedOrganizations;
  }

  if (!profile.brokerId && !profile.REDId) {
    return [];
  }

  const owner = buildOwnerContextFromProfile(profile);
  const ownerRecord = await getOrganizationRecord(ctx, owner);
  if (!ownerRecord) {
    return [];
  }

  return [
    {
      id: String(getOwnerId(owner)),
      type: owner.ownerType === "broker" ? "broker" : "red",
      name: ownerRecord.name,
      slug: ownerRecord.slug,
      status: (ownerRecord as any)?.status ?? null,
      isVerified: (ownerRecord as any)?.isVerified === true,
      description: (ownerRecord as any)?.description,
      website: (ownerRecord as any)?.website,
      contactEmail: (ownerRecord as any)?.contactEmail,
    },
  ];
}

function slugifyOrganizationName(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

async function ensureUniqueOrganizationSlug(
  ctx: AgenciesRepositoryCtx,
  table: "brokers" | "RED",
  baseSlug: string,
) {
  const safeBase = baseSlug || `organization-${crypto.randomUUID().slice(0, 8)}`;

  for (let index = 0; index < 50; index += 1) {
    const candidate = index === 0 ? safeBase : `${safeBase}-${index + 1}`;
    const existing = await ctx.db
      .query(table)
      .withIndex("slug", (q) => q.eq("slug", candidate))
      .first();
    if (!existing) return candidate;
  }

  return `${safeBase}-${crypto.randomUUID().slice(0, 6)}`;
}

async function updateOrganizationForOwner(
  ctx: MutationCtx,
  args: {
    owner: OwnerContext;
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
  },
) {
  const name = args.name.trim().replace(/\s+/g, " ");
  if (!name || name.length < 2) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Organization name must be at least 2 characters" });
  }

  const patch: {
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
  } = { name };

  if ("description" in args) {
    const normalized = args.description?.trim();
    patch.description = normalized && normalized.length > 0 ? normalized : undefined;
  }

  if ("website" in args) {
    const normalized = args.website?.trim();
    if (!normalized) {
      patch.website = undefined;
    } else if (/^https?:\/\//i.test(normalized)) {
      patch.website = normalized;
    } else {
      patch.website = `https://${normalized}`;
    }
  }

  if ("contactEmail" in args) {
    const normalized = normalizeEmail(args.contactEmail ?? "");
    patch.contactEmail = normalized && normalized.length > 0 ? normalized : undefined;
  }

  if (args.owner.ownerType === "broker") {
    await ctx.db.patch(args.owner.ownerBrokerId, patch);
    return ctx.db.get(args.owner.ownerBrokerId);
  }

  await ctx.db.patch(args.owner.ownerREDId, patch);
  return ctx.db.get(args.owner.ownerREDId);
}

/**
 * WHY:   Organization creation is the primary bootstrap path for users entering the workspace with no owner record yet.
 * WHAT:  Creates a broker or developer organization for the specified auth user and links the profile as manager.
 * HOW:   Ensures profile, creates broker/RED, creates tenant org, links, and patches the profile.
 */
export async function createOrganizationForAuthUserRecord(
  ctx: MutationCtx,
  args: {
    authUserId: string;
    email?: string;
    displayName?: string;
    name: string;
    type: "broker" | "red";
    actorAuthUserId?: string;
  },
) {
  const now = Date.now();
  const normalizedName = args.name.trim().replace(/\s+/g, " ");

  if (!normalizedName || normalizedName.length < 2) {
    throw new ConvexError({
      code: "INVALID_ARGUMENT",
      message: "Organization name must be at least 2 characters",
    });
  }

  let profile = await findProfileByAuthUserId(ctx, args.authUserId);

  if (profile?.role === "admin") {
    throw new ConvexError({
      code: "FORBIDDEN",
      message: "Admin accounts cannot create an organization from this flow",
    });
  }

  if (profile?.currentTenantOrgId) {
    throw new ConvexError({
      code: "ORGANIZATION_EXISTS",
      message: "This account already has an organization",
    });
  }

  if (profile?.brokerId) {
    const existingBroker = await ctx.db.get(profile.brokerId);
    if (existingBroker) {
      throw new ConvexError({
        code: "ORGANIZATION_EXISTS",
        message: "This account already has an organization",
      });
    }
  }

  if (profile?.REDId) {
    const existingRed = await ctx.db.get(profile.REDId);
    if (existingRed) {
      throw new ConvexError({
        code: "ORGANIZATION_EXISTS",
        message: "This account already has an organization",
      });
    }
  }

  if (!profile) {
    const usernameBase = args.email?.split("@")[0]?.trim();
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: normalizeEmail(args.email ?? ""),
      name: args.displayName ?? normalizedName,
      username: usernameBase ?? undefined,
      usernameLower: usernameBase?.toLowerCase() ?? undefined,
      role: "user",
      roleStatus: "pending",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    profile = await ctx.db.get(profileId);
  }

  if (!profile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }

  const baseSlug = slugifyOrganizationName(normalizedName);

  if (args.type === "broker") {
    const slug = await ensureUniqueOrganizationSlug(ctx, "brokers", baseSlug);
    const brokerId = await ctx.db.insert("brokers", {
      name: normalizedName,
      slug,
      status: "active",
      isVerified: false,
      contactEmail: args.email ?? profile.email,
    });

    const tenantOrgId = await tenants.createOrganization(ctx as never, profile.authUserId, normalizedName, {
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

    await ctx.db.patch(profile._id, {
      brokerId,
      REDId: undefined,
      currentTenantOrgId: tenantOrgId,
      role: "broker",
      requestedRole: "broker",
      roleStatus: "approved",
      isActive: true,
      updatedAt: now,
    });

    const broker = await ctx.db.get(brokerId);

    await auditLog.log(ctx, {
      action: "organization.created",
      actorId: args.actorAuthUserId ?? args.authUserId,
      resourceType: "tenantOrganizations",
      resourceId: tenantOrgId,
      severity: "info",
      metadata: {
        ownerType: "broker",
        ownerId: String(brokerId),
        name: broker?.name ?? normalizedName,
        slug,
      },
      tags: ["organizations", "create"],
    });

    await auditLog.log(ctx, {
      action: "broker.created",
      actorId: args.actorAuthUserId ?? args.authUserId,
      resourceType: "brokers",
      resourceId: brokerId,
      severity: "info",
      metadata: {
        tenantOrgId,
        name: broker?.name ?? normalizedName,
        slug,
      },
      tags: ["organizations", "broker"],
    });
    return {
      ok: true,
      organization: {
        id: brokerId,
        type: "broker" as const,
        name: broker?.name ?? normalizedName,
        slug,
      },
    };
  }

  const slug = await ensureUniqueOrganizationSlug(ctx, "RED", baseSlug);
  const redId = await ctx.db.insert("RED", {
    name: normalizedName,
    slug,
    status: "active",
    isVerified: false,
    contactEmail: args.email ?? profile.email,
  });

  const tenantOrgId = await tenants.createOrganization(ctx as never, profile.authUserId, normalizedName, {
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

  await ctx.db.patch(profile._id, {
    REDId: redId,
    brokerId: undefined,
    currentTenantOrgId: tenantOrgId,
    role: "developer",
    requestedRole: "developer",
    roleStatus: "approved",
    isActive: true,
    updatedAt: now,
  });

  const red = await ctx.db.get(redId);

  await auditLog.log(ctx, {
    action: "organization.created",
    actorId: args.actorAuthUserId ?? args.authUserId,
    resourceType: "tenantOrganizations",
    resourceId: tenantOrgId,
    severity: "info",
    metadata: {
      ownerType: "red",
      ownerId: String(redId),
      name: red?.name ?? normalizedName,
      slug,
    },
    tags: ["organizations", "create"],
  });

  await auditLog.log(ctx, {
    action: "red.created",
    actorId: args.actorAuthUserId ?? args.authUserId,
    resourceType: "RED",
    resourceId: redId,
    severity: "info",
    metadata: {
      tenantOrgId,
      name: red?.name ?? normalizedName,
      slug,
    },
    tags: ["organizations", "red"],
  });
  return {
    ok: true,
    organization: {
      id: redId,
      type: "red" as const,
      name: red?.name ?? normalizedName,
      slug,
    },
  };
}

/**
 * WHY:   Backend gateways sometimes need to resolve organizations for another auth user directly.
 * WHAT:  Lists organizations linked to the provided auth user id.
 * HOW:   Loads the persisted profile and returns tenant-backed summaries when active.
 */
export const listOrganizationsByAuthUserId = query({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await findProfileByAuthUserId(ctx, args.authUserId);
    if (!profile || profile.isActive === false) return [];
    return listOrganizationsForProfile(ctx, profile);
  },
});

/**
 * WHY:   Workspace bootstrapping needs the current user's linked organizations.
 * WHAT:  Lists organizations for the currently authenticated user.
 * HOW:   Resolves the persisted current profile and returns tenant-backed summaries when active.
 */
export const listCurrentOrganizations = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireCurrentProfile(ctx);
    const persistedProfile = await findProfileByAuthUserId(ctx, profile.authUserId);
    if (!persistedProfile || persistedProfile.isActive === false) return [];
    return listOrganizationsForProfile(ctx, persistedProfile);
  },
});

/**
 * WHY:   Workspace root pages need a single organization + membership payload for the current user.
 * WHAT:  Returns the current organization summary plus the user's membership record.
 * HOW:   Reuses membership gating, then maps the owner record into the stable DTO.
 */
export const getCurrentOrganization = query({
  args: {},
  handler: async (ctx) => {
    try {
      const { owner, membership } = await requireOrganizationMembership(ctx);
      const organization = await getOrganizationRecord(ctx, owner);
      if (!organization) {
        throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
      }

      return {
        organization: {
          id: String(getOwnerId(owner)),
          type: owner.ownerType === "broker" ? "broker" : "red",
          name: organization.name,
          slug: organization.slug,
          status: organization.status ?? null,
          isVerified: organization.isVerified === true,
          description: organization.description,
          website: organization.website,
          contactEmail: organization.contactEmail,
        },
        membership,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (
        message.includes("Organization owner profile required") ||
        message.includes("Organization membership required") ||
        message.includes("Profile not found") ||
        message.includes("Tenant organization required") ||
        message.includes("Tenant organization link required") ||
        message.includes("Broker organization link required") ||
        message.includes("Developer organization link required")
      ) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Organization membership required" });
      }
      throw error;
    }
  },
});

/**
 * WHY:   Gateway-owned backoffice flows still need a direct auth-user create mutation during migration.
 * WHAT:  Creates an organization for the provided auth user id.
 * HOW:   Delegates to the shared record helper.
 */
export const createOrganizationForAuthUser = mutation({
  args: {
    authUserId: v.string(),
    email: v.optional(v.string()),
    displayName: v.optional(v.string()),
    name: v.string(),
    type: v.union(v.literal("broker"), v.literal("red")),
  },
  handler: async (ctx, args) => {
    const actor = await requireSession(ctx);
    return createOrganizationForAuthUserRecord(ctx, {
      ...args,
      actorAuthUserId: actor.authUserId,
    });
  },
});

/**
 * WHY:   The workspace onboarding flow needs one current-user create mutation with no exposed auth-user plumbing.
 * WHAT:  Creates an organization for the current authenticated profile.
 * HOW:   Resolves the current profile and delegates to the shared auth-user create helper.
 */
export const createOrganizationForCurrentUser = mutation({
  args: {
    name: v.string(),
    type: v.union(v.literal("broker"), v.literal("red")),
  },
  handler: async (ctx, args) => {
    const profile = await requireCurrentProfile(ctx);
    return createOrganizationForAuthUserRecord(ctx, {
      authUserId: profile.authUserId,
      email: profile.email,
      displayName: profile.name,
      actorAuthUserId: profile.authUserId,
      ...args,
    });
  },
});

/**
 * WHY:   Organization settings need one manager-gated mutation for editing the current owner's organization summary.
 * WHAT:  Updates the current organization name and returns the normalized summary DTO.
 * HOW:   Requires manager access, updates tenants and broker/RED records, and maps to the stable response shape.
 */
export const updateCurrentOrganization = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    website: v.optional(v.string()),
    contactEmail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireManagerAccess(ctx);
    if (!owner.tenantOrgId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
    }

    const [beforeTenantOrg, beforeOwnerRecord] = await Promise.all([
      tenants.getOrganization(ctx as never, owner.tenantOrgId),
      owner.ownerType === "broker" ? ctx.db.get(owner.ownerBrokerId) : ctx.db.get(owner.ownerREDId),
    ]);

    await tenants.updateOrganization(ctx as never, profile.authUserId, owner.tenantOrgId, {
      name: args.name,
    });

    const organization = await updateOrganizationForOwner(ctx, {
      owner,
      name: args.name,
      description: args.description,
      website: args.website,
      contactEmail: args.contactEmail,
    });
    if (!organization) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
    }

    const afterTenantOrg = await tenants.getOrganization(ctx as never, owner.tenantOrgId);

    await auditLog.logChange(ctx, {
      action: "organization.updated",
      actorId: profile.authUserId,
      resourceType: "tenantOrganizations",
      resourceId: owner.tenantOrgId,
      before: beforeTenantOrg,
      after: afterTenantOrg,
      generateDiff: true,
      severity: "info",
      tags: ["organizations", "update"],
    });

    await auditLog.logChange(ctx, {
      action: owner.ownerType === "broker" ? "broker.updated" : "red.updated",
      actorId: profile.authUserId,
      resourceType: owner.ownerType === "broker" ? "brokers" : "RED",
      resourceId: getOwnerId(owner),
      before: beforeOwnerRecord,
      after: organization,
      generateDiff: true,
      severity: "info",
      tags: ["organizations", owner.ownerType],
    });

    return {
      id: getOwnerId(owner),
      type: owner.ownerType === "broker" ? "broker" : "red",
      name: organization.name,
      slug: organization.slug,
      status: organization.status ?? null,
      isVerified: organization.isVerified === true,
      description: organization.description,
      website: organization.website,
      contactEmail: organization.contactEmail,
    } as const;
  },
});

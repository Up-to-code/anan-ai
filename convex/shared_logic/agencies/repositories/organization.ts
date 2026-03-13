import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import type { MutationCtx } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import {
  findProfileByAuthUserId,
  getOwnerId,
  normalizeEmail,
  type AgenciesRepositoryCtx,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";
import { ensureOwnerManagerMembership, requireManagerAccess } from "./membership";

async function listOrganizationsForProfile(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  const organizations: Array<{
    id: typeof profile.brokerId | typeof profile.REDId;
    type: "broker" | "red";
    name: string;
    slug: string;
    status: "active" | "pending" | null;
    isVerified: boolean;
    description?: string;
    website?: string;
    contactEmail?: string;
  }> = [];

  if (profile?.brokerId) {
    const broker = await ctx.db.get(profile.brokerId);
    if (broker) {
      organizations.push({
        id: broker._id,
        type: "broker",
        name: broker.name,
        slug: broker.slug,
        status: broker.status ?? null,
        isVerified: broker.isVerified === true,
        description: broker.description,
        website: broker.website,
        contactEmail: broker.contactEmail,
      });
    }
  }

  if (profile?.REDId) {
    const red = await ctx.db.get(profile.REDId);
    if (red) {
      organizations.push({
        id: red._id,
        type: "red",
        name: red.name,
        slug: red.slug,
        status: red.status ?? null,
        isVerified: red.isVerified === true,
        description: red.description,
        website: red.website,
        contactEmail: red.contactEmail,
      });
    }
  }

  return organizations;
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

async function reconcileOrganizationLinks(ctx: MutationCtx, profile: UserProfileRecord, now: number) {
  let hasExistingOrganization = false;
  const patch: Record<string, undefined | number> = {};

  if (profile.brokerId) {
    const broker = await ctx.db.get(profile.brokerId);
    if (broker) {
      hasExistingOrganization = true;
    } else {
      patch.brokerId = undefined;
    }
  }

  if (profile.REDId) {
    const red = await ctx.db.get(profile.REDId);
    if (red) {
      hasExistingOrganization = true;
    } else {
      patch.REDId = undefined;
    }
  }

  if (Object.keys(patch).length > 0) {
    patch.updatedAt = now;
    await ctx.db.patch(profile._id, patch);
    return { hasExistingOrganization, profile: { ...profile, ...patch } };
  }

  return { hasExistingOrganization, profile };
}

async function updateOrganizationForOwner(
  ctx: MutationCtx,
  args: { owner: OwnerContext; name: string },
) {
  const name = args.name.trim().replace(/\s+/g, " ");
  if (!name || name.length < 2) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Organization name must be at least 2 characters" });
  }

  if (args.owner.ownerType === "broker") {
    await ctx.db.patch(args.owner.ownerBrokerId, { name });
    return ctx.db.get(args.owner.ownerBrokerId);
  }

  await ctx.db.patch(args.owner.ownerREDId, { name });
  return ctx.db.get(args.owner.ownerREDId);
}

/**
 * WHY:   Organization creation is the primary bootstrap path for users entering the workspace with no owner record yet.
 * WHAT:  Creates a broker or developer organization for the specified auth user and links the profile as manager.
 * HOW:   Reconciles stale owner links, blocks duplicates, creates the owner record, patches the profile, and ensures manager membership.
 */
export async function createOrganizationForAuthUserRecord(
  ctx: MutationCtx,
  args: {
    authUserId: string;
    email?: string;
    displayName?: string;
    name: string;
    type: "broker" | "red";
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

  if (profile) {
    const reconciled = await reconcileOrganizationLinks(ctx, profile, now);
    profile = reconciled.profile;
    if (reconciled.hasExistingOrganization || profile.brokerId || profile.REDId) {
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

    await ctx.db.patch(profile._id, {
      brokerId,
      REDId: undefined,
      role: "broker",
      requestedRole: "broker",
      roleStatus: "approved",
      isActive: true,
      updatedAt: now,
    });

    await ensureOwnerManagerMembership(ctx, { ...profile, brokerId }, {
      ownerType: "broker",
      ownerBrokerId: brokerId,
      authUserId: profile.authUserId,
    });

    const broker = await ctx.db.get(brokerId);
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

  await ctx.db.patch(profile._id, {
    REDId: redId,
    brokerId: undefined,
    role: "developer",
    requestedRole: "developer",
    roleStatus: "approved",
    isActive: true,
    updatedAt: now,
  });

  await ensureOwnerManagerMembership(ctx, { ...profile, REDId: redId }, {
    ownerType: "RED",
    ownerREDId: redId,
    authUserId: profile.authUserId,
  });

  const red = await ctx.db.get(redId);
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
 * HOW:   Loads the persisted profile and returns broker/developer summaries when the profile is active.
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
 * HOW:   Resolves the persisted current profile and returns the linked organization summaries when active.
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
    return createOrganizationForAuthUserRecord(ctx, args);
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
      ...args,
    });
  },
});

/**
 * WHY:   Organization settings need one manager-gated mutation for editing the current owner's organization summary.
 * WHAT:  Updates the current organization name and returns the normalized summary DTO.
 * HOW:   Requires manager access, patches the owner record, and maps it into the stable response shape.
 */
export const updateCurrentOrganization = mutation({
  args: {
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const { owner } = await requireManagerAccess(ctx);
    const organization = await updateOrganizationForOwner(ctx, { owner, name: args.name });
    if (!organization) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Organization not found" });
    }

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

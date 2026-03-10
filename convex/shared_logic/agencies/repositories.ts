import { ConvexError, v, type GenericId } from "convex/values";
import type { Doc } from "../../_generated/dataModel";
import { mutation, query } from "../../_generated/server";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type AgenciesRepositoryCtx = QueryCtx | MutationCtx;
type UserProfileRecord = Doc<"userProfiles">;
type TeamInviteRecord = Doc<"teamInvites">;

type OwnerContext =
  | {
      ownerType: "broker";
      ownerBrokerId: GenericId<"brokers">;
      authUserId: string;
    }
  | {
      ownerType: "RED";
      ownerREDId: GenericId<"RED">;
      authUserId: string;
    };

async function findProfileByAuthUserId(ctx: AgenciesRepositoryCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .first();
}

async function listOrganizationsForProfile(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  const organizations: Array<{
    id: GenericId<"brokers"> | GenericId<"RED">;
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
    const profileId = await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email ?? "",
      name: args.displayName ?? normalizedName,
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

function ensureInviteNotExpired(invite: { expiresAt: number; status: string }) {
  if (invite.status !== "pending") return;
  if (invite.expiresAt < Date.now()) {
    throw new ConvexError({ code: "INVITE_EXPIRED", message: "Invite has expired" });
  }
}

function buildOwnerContext(args: {
  ownerType: "broker" | "RED";
  ownerBrokerId?: GenericId<"brokers">;
  ownerREDId?: GenericId<"RED">;
  authUserId?: string;
}): OwnerContext {
  if (args.ownerType === "broker") {
    if (!args.ownerBrokerId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Broker owner required" });
    }
    return {
      ownerType: "broker",
      ownerBrokerId: args.ownerBrokerId,
      authUserId: args.authUserId ?? "",
    };
  }

  if (!args.ownerREDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Developer owner required" });
  }

  return {
    ownerType: "RED",
    ownerREDId: args.ownerREDId,
    authUserId: args.authUserId ?? "",
  };
}

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

export const listTeamMembersByOwner = query({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    const records =
      owner.ownerType === "broker"
        ? await ctx.db
            .query("userProfiles")
            .filter((q) => q.eq(q.field("brokerId"), owner.ownerBrokerId))
            .collect()
        : await ctx.db
            .query("userProfiles")
            .filter((q) => q.eq(q.field("REDId"), owner.ownerREDId))
            .collect();

    return records.map((record) => ({
      id: record._id,
      authUserId: record.authUserId,
      name: record.name,
      email: record.email,
      role: record.role,
      roleStatus: record.roleStatus,
      isActive: record.isActive,
    }));
  },
});

export const listTeamInvitesByOwner = query({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    const records =
      owner.ownerType === "broker"
        ? await ctx.db
            .query("teamInvites")
            .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId))
            .collect()
        : await ctx.db
            .query("teamInvites")
            .withIndex("ownerREDId", (q) => q.eq("ownerREDId", owner.ownerREDId))
            .collect();

    return records
      .filter((invite: TeamInviteRecord) => invite.status === "pending" || invite.status === "accepted")
      .map((invite: TeamInviteRecord) => ({
        id: invite._id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        token: invite.token,
        expiresAt: invite.expiresAt,
        acceptedAt: invite.acceptedAt,
      }));
  },
});

export const createTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    authUserId: v.string(),
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    owner.authUserId = args.authUserId;
    const normalizedEmail = args.email.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Email is required" });
    }

    const existing =
      owner.ownerType === "broker"
        ? await ctx.db
            .query("teamInvites")
            .withIndex("ownerBrokerId", (q) => q.eq("ownerBrokerId", owner.ownerBrokerId))
            .collect()
        : await ctx.db
            .query("teamInvites")
            .withIndex("ownerREDId", (q) => q.eq("ownerREDId", owner.ownerREDId))
            .collect();

    const duplicate = existing.find(
      (invite: TeamInviteRecord) => invite.email.toLowerCase() === normalizedEmail && invite.status === "pending",
    );
    if (duplicate) {
      throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
    }

    const now = Date.now();
    return ctx.db.insert("teamInvites", {
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      email: normalizedEmail,
      role: args.role,
      token: `invite_${crypto.randomUUID().replace(/-/g, "")}`,
      status: "pending",
      invitedBy: owner.authUserId,
      expiresAt: now + INVITE_TTL_MS,
    });
  },
});

export const cancelTeamInviteForOwner = mutation({
  args: {
    ownerType: v.union(v.literal("broker"), v.literal("RED")),
    ownerBrokerId: v.optional(v.id("brokers")),
    ownerREDId: v.optional(v.id("RED")),
    inviteId: v.id("teamInvites"),
  },
  handler: async (ctx, args) => {
    const owner = buildOwnerContext(args);
    const invite = await ctx.db.get(args.inviteId);
    if (!invite) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
    }
    const ownsInvite =
      (owner.ownerType === "broker" && invite.ownerBrokerId === owner.ownerBrokerId) ||
      (owner.ownerType === "RED" && invite.ownerREDId === owner.ownerREDId);
    if (!ownsInvite) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Cannot cancel this invite" });
    }
    await ctx.db.patch(args.inviteId, { status: "canceled" });
    return { ok: true } as const;
  },
});

export const acceptTeamInviteForAuthUser = mutation({
  args: {
    authUserId: v.string(),
    token: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await findProfileByAuthUserId(ctx, args.authUserId);
    if (!profile) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
    }

    const invite = await ctx.db
      .query("teamInvites")
      .withIndex("token", (q) => q.eq("token", args.token))
      .first();

    if (!invite) {
      throw new ConvexError({ code: "NOT_FOUND", message: "Invite not found" });
    }

    ensureInviteNotExpired(invite);

    if (invite.ownerType === "broker") {
      await ctx.db.patch(profile._id, {
        brokerId: invite.ownerBrokerId,
        REDId: undefined,
        role: "broker",
        isActive: true,
      });
    } else {
      await ctx.db.patch(profile._id, {
        REDId: invite.ownerREDId,
        brokerId: undefined,
        role: "developer",
        isActive: true,
      });
    }

    await ctx.db.patch(invite._id, {
      status: "accepted",
      acceptedBy: args.authUserId,
      acceptedAt: Date.now(),
    });

    return { ok: true } as const;
  },
});

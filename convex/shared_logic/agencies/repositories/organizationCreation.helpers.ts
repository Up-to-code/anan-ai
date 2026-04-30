import { ConvexError } from "convex/values";
import type { MutationCtx } from "../../../_generated/server";
import { auditLog } from "../../../auditLog";
import { tenants } from "../../../tenants";
import { getAdminPlatformAccess } from "../../../_core/security/adminAccess";
import {
  buildOwnerContext,
  findProfileByAuthUserId,
  normalizeEmail,
  type AgenciesRepositoryCtx,
} from "./core";
import { enqueueOrganizationUpsertForZaneAi } from "../../integrations/zaneAiWebhook";

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
    countryCode: string;
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

  if (getAdminPlatformAccess(profile as never)) {
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

  if ((profile as any)?.developerId) {
    const existingRed = await ctx.db.get((profile as any).developerId);
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
      roleApprovalStatus: "pending",
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
      countryCode: args.countryCode,
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
      developerId: undefined,
      REDId: undefined,
      currentTenantOrgId: tenantOrgId,
      role: "broker",
      requestedRole: "broker",
      roleApprovalStatus: "approved",
      roleStatus: undefined,
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
    await enqueueOrganizationUpsertForZaneAi(
      ctx,
      buildOwnerContext({ ownerType: "broker", ownerBrokerId: brokerId, authUserId: profile.authUserId }),
      { authUserId: args.actorAuthUserId ?? args.authUserId, role: "manager" },
    );
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
    countryCode: args.countryCode,
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
    developerId: redId,
    REDId: undefined,
    brokerId: undefined,
    currentTenantOrgId: tenantOrgId,
    role: "developer",
    requestedRole: "developer",
    roleApprovalStatus: "approved",
    roleStatus: undefined,
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
  await enqueueOrganizationUpsertForZaneAi(
    ctx,
    buildOwnerContext({ ownerType: "RED", ownerREDId: redId, authUserId: profile.authUserId }),
    { authUserId: args.actorAuthUserId ?? args.authUserId, role: "manager" },
  );
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

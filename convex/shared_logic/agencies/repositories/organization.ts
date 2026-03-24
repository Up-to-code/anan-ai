import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { requireCurrentProfile } from "../../lib/profile";
import { auditLog } from "../../../auditLog";
import { requireSession } from "../../../_core/security/accessPolicy";
import {
  findProfileByAuthUserId,
  getOwnerId,
  getOrganizationRecord,
} from "./core";
import { requireManagerAccess, requireOrganizationMembership } from "./membership";
import { tenants } from "../../../tenants";
import { createOrganizationForAuthUserRecord } from "./organizationCreation.helpers";
import {
  listOrganizationsForProfile,
  updateOrganizationForOwner,
} from "./organizationProfile.helpers";

const ORGANIZATION_ACCESS_ERROR_MESSAGES = [
  "Organization owner profile required",
  "Organization membership required",
  "Profile not found",
  "Tenant organization required",
  "Tenant organization link required",
  "Broker organization link required",
  "Developer organization link required",
] as const;

function hasOrganizationAccessError(message: string) {
  return ORGANIZATION_ACCESS_ERROR_MESSAGES.some((token) => message.includes(token));
}

function requireTenantOrgId(owner: { tenantOrgId?: string }) {
  if (!owner.tenantOrgId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Tenant organization required" });
  }
  return owner.tenantOrgId;
}

async function getBeforeUpdateState(ctx: any, owner: any, tenantOrgId: string) {
  return Promise.all([
    tenants.getOrganization(ctx as never, tenantOrgId),
    owner.ownerType === "broker" ? ctx.db.get(owner.ownerBrokerId) : ctx.db.get(owner.ownerREDId),
  ]);
}

async function logOrganizationUpdateAudits(params: {
  ctx: any;
  owner: any;
  actorAuthUserId: string;
  tenantOrgId: string;
  beforeTenantOrg: unknown;
  afterTenantOrg: unknown;
  beforeOwnerRecord: unknown;
  organization: any;
}) {
  const { ctx, owner, actorAuthUserId, tenantOrgId, beforeTenantOrg, afterTenantOrg, beforeOwnerRecord, organization } = params;
  await auditLog.logChange(ctx, {
    action: "organization.updated",
    actorId: actorAuthUserId,
    resourceType: "tenantOrganizations",
    resourceId: tenantOrgId,
    before: beforeTenantOrg,
    after: afterTenantOrg,
    generateDiff: true,
    severity: "info",
    tags: ["organizations", "update"],
  });
  await auditLog.logChange(ctx, {
    action: owner.ownerType === "broker" ? "broker.updated" : "red.updated",
    actorId: actorAuthUserId,
    resourceType: owner.ownerType === "broker" ? "brokers" : "RED",
    resourceId: getOwnerId(owner),
    before: beforeOwnerRecord,
    after: organization,
    generateDiff: true,
    severity: "info",
    tags: ["organizations", owner.ownerType],
  });
}

function mapOrganizationSummary(owner: any, organization: any) {
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
      if (hasOrganizationAccessError(message)) {
        return {
          organization: null,
          membership: null,
          accessError: true as const,
        };
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
    const tenantOrgId = requireTenantOrgId(owner);
    const [beforeTenantOrg, beforeOwnerRecord] = await getBeforeUpdateState(ctx, owner, tenantOrgId);
    await tenants.updateOrganization(ctx as never, profile.authUserId, tenantOrgId, {
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
    const afterTenantOrg = await tenants.getOrganization(ctx as never, tenantOrgId);
    await logOrganizationUpdateAudits({
      ctx,
      owner,
      actorAuthUserId: profile.authUserId,
      tenantOrgId,
      beforeTenantOrg,
      afterTenantOrg,
      beforeOwnerRecord,
      organization,
    });
    return mapOrganizationSummary(owner, organization);
  },
});

export { createOrganizationForAuthUserRecord };

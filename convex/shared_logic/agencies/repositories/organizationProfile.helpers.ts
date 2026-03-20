import { ConvexError } from "convex/values";
import type { MutationCtx } from "../../../_generated/server";
import { tenants } from "../../../tenants";
import {
  buildOwnerContextFromProfile,
  findTenantOrgLinkByTenantOrgId,
  getOrganizationRecord,
  getOwnerId,
  normalizeEmail,
  type AgenciesRepositoryCtx,
  type OwnerContext,
  type UserProfileRecord,
} from "./core";

function toOrganizationSummary(base: {
  id: string;
  type: "broker" | "red";
  ownerRecord: any;
  fallbackName: string;
  fallbackSlug?: string;
}) {
  const { id, type, ownerRecord, fallbackName, fallbackSlug } = base;
  return {
    id,
    type,
    name: ownerRecord?.name ?? fallbackName,
    slug: ownerRecord?.slug ?? fallbackSlug,
    status: ownerRecord?.status ?? null,
    isVerified: ownerRecord?.isVerified === true,
    description: ownerRecord?.description,
    website: ownerRecord?.website,
    contactEmail: ownerRecord?.contactEmail,
  };
}

async function listTenantLinkedOrganizations(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  const tenantOrgs = await tenants.listOrganizations(ctx as never, profile.authUserId);
  const organizations = await Promise.all(
    tenantOrgs.map(async (org) => {
      const link = await findTenantOrgLinkByTenantOrgId(ctx, org._id);
      if (!link) {
        return null;
      }
      const ownerType = link.ownerType === "broker" ? ("broker" as const) : ("red" as const);
      const ownerRecord =
        link.ownerType === "broker"
          ? await ctx.db.get(link.ownerBrokerId!)
          : await ctx.db.get(link.ownerREDId!);
      return toOrganizationSummary({
        id: String(link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId),
        type: ownerType,
        ownerRecord,
        fallbackName: org.name,
        fallbackSlug: org.slug,
      });
    }),
  );
  return organizations.filter((org): org is NonNullable<typeof org> => Boolean(org));
}

async function getProfileOwnerFallbackOrganization(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  if (!profile.brokerId && !profile.REDId) {
    return [];
  }
  const owner = buildOwnerContextFromProfile(profile);
  const ownerRecord = await getOrganizationRecord(ctx, owner);
  if (!ownerRecord) {
    return [];
  }
  return [toOrganizationSummary({
    id: String(getOwnerId(owner)),
    type: owner.ownerType === "broker" ? "broker" : "red",
    ownerRecord,
    fallbackName: ownerRecord.name,
    fallbackSlug: ownerRecord.slug,
  })];
}

export async function listOrganizationsForProfile(ctx: AgenciesRepositoryCtx, profile: UserProfileRecord) {
  const hydratedOrganizations = await listTenantLinkedOrganizations(ctx, profile);
  if (hydratedOrganizations.length > 0) {
    return hydratedOrganizations;
  }
  return getProfileOwnerFallbackOrganization(ctx, profile);
}

function normalizeOrganizationName(rawName: string) {
  const name = rawName.trim().replace(/\s+/g, " ");
  if (!name || name.length < 2) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Organization name must be at least 2 characters" });
  }
  return name;
}

function normalizeWebsite(website: string | undefined) {
  const normalized = website?.trim();
  if (!normalized) {
    return undefined;
  }
  return /^https?:\/\//i.test(normalized) ? normalized : `https://${normalized}`;
}

function buildOrganizationPatch(args: {
  name: string;
  description?: string;
  website?: string;
  contactEmail?: string;
}) {
  const patch: { name: string; description?: string; website?: string; contactEmail?: string } = {
    name: normalizeOrganizationName(args.name),
  };
  if ("description" in args) {
    const normalized = args.description?.trim();
    patch.description = normalized && normalized.length > 0 ? normalized : undefined;
  }
  if ("website" in args) {
    patch.website = normalizeWebsite(args.website);
  }
  if ("contactEmail" in args) {
    const normalized = normalizeEmail(args.contactEmail ?? "");
    patch.contactEmail = normalized && normalized.length > 0 ? normalized : undefined;
  }
  return patch;
}

export async function updateOrganizationForOwner(
  ctx: MutationCtx,
  args: {
    owner: OwnerContext;
    name: string;
    description?: string;
    website?: string;
    contactEmail?: string;
  },
) {
  const patch = buildOrganizationPatch(args);

  if (args.owner.ownerType === "broker") {
    await ctx.db.patch(args.owner.ownerBrokerId, patch);
    return ctx.db.get(args.owner.ownerBrokerId);
  }

  await ctx.db.patch(args.owner.ownerREDId, patch);
  return ctx.db.get(args.owner.ownerREDId);
}

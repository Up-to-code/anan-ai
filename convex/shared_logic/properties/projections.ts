import type { GenericId } from "convex/values";
import type { MutationCtx } from "../../_generated/server";
import { findActiveComplianceRuleset } from "../compliance/utils";
import {
  buildOwnerContext,
  findTenantOrgLinkByOwner,
  getOrganizationRecord,
  type OwnerContext,
} from "../agencies/repositories/core";

type PropertyProjectionArgs = {
  ownerField: "brokerId" | "REDId";
  ownerId: GenericId<"brokers"> | GenericId<"RED">;
  publicationState?: "draft" | "published" | "archived";
  adLicenseStatus?: "pending" | "approved" | "rejected";
  projectReadinessStatus?: string;
};

type OrganizationSummary = {
  countryCode?: string;
  isVerified?: boolean;
};

type ProjectSummaryRow = {
  _id: GenericId<"organizationProjectSummaries">;
  propertyCount: number;
  publishedPropertyCount: number;
  draftPropertyCount: number;
  archivedPropertyCount: number;
  lastPropertyCreatedAt?: number;
};

function toOwnerContext(args: Pick<PropertyProjectionArgs, "ownerField" | "ownerId">): OwnerContext {
  return args.ownerField === "brokerId"
    ? buildOwnerContext({
        ownerType: "broker",
        ownerBrokerId: args.ownerId as GenericId<"brokers">,
      })
    : buildOwnerContext({
        ownerType: "RED",
        ownerREDId: args.ownerId as GenericId<"RED">,
      });
}

/**
 * WHY:   Property reads should not resolve owner metadata row-by-row during public search.
 * WHAT:  Computes the denormalized owner and public-visibility fields stored on the property row.
 * HOW:   Resolves the owner organization plus active compliance ruleset and derives a stable searchability flag.
 */
export async function buildPropertyProjectionFields(
  ctx: MutationCtx,
  args: PropertyProjectionArgs,
) {
  const owner = toOwnerContext(args);
  const [tenantLink, organization] = await Promise.all([
    findTenantOrgLinkByOwner(ctx, owner),
    getOrganizationRecord(ctx, owner) as Promise<OrganizationSummary | null>,
  ]);
  const tenantOrgId = tenantLink?.tenantOrgId;
  const ownerCountryCode = organization?.countryCode;
  const ownerVerified = organization?.isVerified === true;
  const listingVerified = args.adLicenseStatus === "approved";
  const orgType = owner.ownerType === "broker" ? "broker" as const : "red" as const;
  const ruleset = ownerCountryCode
    ? await findActiveComplianceRuleset(ctx, { countryCode: ownerCountryCode, orgType })
    : null;

  let isPublicSearchable =
    args.publicationState === "published" &&
    args.projectReadinessStatus === "published_ready";
  if (ruleset?.enforcement.hideUnverified) {
    if (ruleset.enforcement.requireOrgVerification && !ownerVerified) {
      isPublicSearchable = false;
    }
    if (ruleset.enforcement.requireListingVerification && !listingVerified) {
      isPublicSearchable = false;
    }
  }

  return {
    tenantOrgId,
    ownerType: owner.ownerType,
    ownerCountryCode,
    ownerVerified,
    listingVerified,
    isPublicSearchable,
  };
}

async function getProjectSummaryRow(
  ctx: MutationCtx,
  owner: OwnerContext,
): Promise<ProjectSummaryRow | null> {
  if (!owner.tenantOrgId) return null;
  return ctx.db
    .query("organizationProjectSummaries")
    .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", owner.tenantOrgId!))
    .first() as Promise<ProjectSummaryRow | null>;
}

/**
 * WHY:   Overview counts should read from one org summary row instead of scanning all inventory.
 * WHAT:  Applies a property lifecycle delta to the owning organization summary.
 * HOW:   Upserts a single tenant-scoped summary row with counts and latest creation timestamp.
 */
export async function applyOrganizationProjectSummaryDelta(
  ctx: MutationCtx,
  args: {
    ownerField: "brokerId" | "REDId";
    ownerId: GenericId<"brokers"> | GenericId<"RED">;
    previousPublicationState?: "draft" | "published" | "archived" | undefined;
    nextPublicationState?: "draft" | "published" | "archived" | undefined;
    createdAt?: number;
    delta?: number;
  },
) {
  const baseOwner = toOwnerContext(args);
  const tenantLink = await findTenantOrgLinkByOwner(ctx, baseOwner);
  if (!tenantLink?.tenantOrgId) {
    return;
  }
  const owner = {
    ...baseOwner,
    tenantOrgId: tenantLink.tenantOrgId,
  } as OwnerContext;
  const existing = await getProjectSummaryRow(ctx, owner);
  const delta = args.delta ?? 0;
  const previous = args.previousPublicationState;
  const next = args.nextPublicationState;

  const patch = {
    propertyCount: Math.max(0, (existing?.propertyCount ?? 0) + delta),
    publishedPropertyCount:
      (existing?.publishedPropertyCount ?? 0) +
      (previous === "published" ? -1 : 0) +
      (next === "published" ? 1 : 0),
    draftPropertyCount:
      (existing?.draftPropertyCount ?? 0) +
      (previous === "draft" ? -1 : 0) +
      (next === "draft" ? 1 : 0),
    archivedPropertyCount:
      (existing?.archivedPropertyCount ?? 0) +
      (previous === "archived" ? -1 : 0) +
      (next === "archived" ? 1 : 0),
    lastPropertyCreatedAt: Math.max(existing?.lastPropertyCreatedAt ?? 0, args.createdAt ?? 0) || undefined,
    updatedAt: Date.now(),
  };

  if (existing) {
    await ctx.db.patch(existing._id, patch);
    return;
  }

  await ctx.db.insert("organizationProjectSummaries", {
    tenantOrgId: owner.tenantOrgId!,
    ownerType: owner.ownerType,
    ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
    ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
    ...patch,
  });
}

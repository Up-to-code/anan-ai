import { ConvexError } from "convex/values";
import type { PaginationOptions } from "convex/server";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";
import { buildPropertySearchText } from "../searchText";
import {
  applyOrganizationProjectSummaryDelta,
  buildPropertyProjectionFields,
} from "../projections";
import {
  ensureProjectDossierForProperty,
} from "../../projects/migrations";
import {
  recomputeProjectReadinessForProperty,
} from "../../projects/readiness";
import type {
  OwnerScopedOwnerField,
  OwnerScopedOwnerId,
  OwnerScopedPropertyUpdateArgs,
  OwnerScopedPropertyWriteFields,
  PropertyStatus,
} from "../types";

function buildOwnerScopedQuery(
  ctx: QueryCtx,
  ownerField: OwnerScopedOwnerField,
  ownerId: OwnerScopedOwnerId,
) {
  return ctx.db
    .query("properties")
    .withIndex(ownerField, (q: any) => q.eq(ownerField, ownerId))
    .filter((q: any) => q.eq(q.field("deletedAt"), undefined));
}

function resolveOwnerState(existing: {
  brokerId?: OwnerScopedOwnerId;
  REDId?: OwnerScopedOwnerId;
}) {
  if (existing.brokerId) {
    return { ownerField: "brokerId" as const, ownerId: existing.brokerId };
  }
  if (existing.REDId) {
    return { ownerField: "REDId" as const, ownerId: existing.REDId };
  }
  throw new ConvexError({ code: "FORBIDDEN", message: "Property owner required" });
}

async function requirePropertyRecord(
  ctx: MutationCtx,
  id: OwnerScopedPropertyUpdateArgs["id"],
) {
  const existing = await ctx.db.get(id);
  if (!existing) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return existing;
}

/**
 * WHY:   Broker and RED property surfaces need one shared persistence path for owner-scoped pagination.
 * WHAT:  Lists properties for one owner field with optional status filtering and pagination.
 * HOW:   Reuses the indexed `properties` lookup for `brokerId` or `REDId`, then applies the shared status filter.
 */
export async function listOwnerScopedProperties(
  ctx: QueryCtx,
  args: {
    paginationOpts: PaginationOptions;
    status?: PropertyStatus;
    ownerField: OwnerScopedOwnerField;
    ownerId: OwnerScopedOwnerId;
  },
) {
  const query = buildOwnerScopedQuery(ctx, args.ownerField, args.ownerId);
  if (args.status) {
    const compositeIndex =
      args.ownerField === "brokerId" ? "brokerId_status_updatedAt" : "REDId_status_updatedAt";
    return ctx.db
      .query("properties")
      .withIndex(compositeIndex, (q: any) =>
        q.eq(args.ownerField, args.ownerId).eq("status", args.status),
      )
      .filter((q: any) => q.eq(q.field("deletedAt"), undefined))
      .order("desc")
      .paginate(args.paginationOpts);
  }
  return query.order("desc").paginate(args.paginationOpts);
}

/**
 * WHY:   Owner-scoped property repositories should not duplicate raw record lookup behavior.
 * WHAT:  Returns a property record by id with no ownership enforcement.
 * HOW:   Reads the row directly from the `properties` table.
 */
export async function getOwnerScopedPropertyById(
  ctx: QueryCtx,
  args: { id: OwnerScopedPropertyUpdateArgs["id"] },
) {
  const property = await ctx.db.get(args.id);
  return property && typeof (property as any).deletedAt !== "number" ? property : null;
}

/**
 * WHY:   Owner-scoped property creation must build the same derived fields for both broker and RED flows.
 * WHAT:  Inserts a property for the provided owner field and owner id.
 * HOW:   Sets `heroImage`, builds `searchText`, and defaults `publicationState` to `draft`.
 */
export async function createOwnerScopedProperty(
  ctx: MutationCtx,
  args: {
    ownerField: OwnerScopedOwnerField;
    ownerId: OwnerScopedOwnerId;
  } & OwnerScopedPropertyWriteFields,
) {
  const { ownerField, ownerId, ...rest } = args;
  const requestedVisibility = rest.publicationState === "published" ? "public" : "private";
  const heroImage = rest.media?.[0];
  const searchText = buildPropertySearchText(rest);
  const now = Date.now();
  const projections = await buildPropertyProjectionFields(ctx, {
    ownerField,
    ownerId,
    publicationState: "draft",
    adLicenseStatus: (rest as any).adLicenseStatus,
    projectReadinessStatus: "incomplete",
  });

  const propertyId = await ctx.db.insert("properties", {
    ...rest,
    heroImage,
    searchText,
    ...projections,
    [ownerField]: ownerId,
    publicationState: "draft",
    projectReadinessStatus: "incomplete",
    createdAt: now,
    updatedAt: now,
  } as any);
  await ensureProjectDossierForProperty(ctx, propertyId, {
    includeLegacyUnitAndPaymentPlan: true,
    requestedVisibility,
  });
  await applyOrganizationProjectSummaryDelta(ctx, {
    ownerField,
    ownerId,
    nextPublicationState: "draft" as any,
    createdAt: now,
    delta: 1,
  });
  return propertyId;
}

/**
 * WHY:   Broker and RED update flows should share the same derived search-text refresh logic.
 * WHAT:  Patches one property and rebuilds its derived fields.
 * HOW:   Loads the existing row, merges the patch, and writes `heroImage` plus `searchText`.
 */
export async function updateOwnerScopedProperty(
  ctx: MutationCtx,
  { id, ...patch }: OwnerScopedPropertyUpdateArgs,
) {
  const existing = await requirePropertyRecord(ctx, id);
  const requestedVisibility = patch.publicationState === "published" ? "public" : undefined;
  const normalizedPatch =
    patch.publicationState === "published"
      ? ({ ...patch, publicationState: "draft" } as typeof patch)
      : patch;
  const heroImage = normalizedPatch.media?.[0] ?? existing.heroImage;
  const merged = { ...existing, ...normalizedPatch, heroImage };
  const searchText = buildPropertySearchText(merged);
  const owner = resolveOwnerState(existing as any);
  const projections = await buildPropertyProjectionFields(ctx, {
    ownerField: owner.ownerField,
    ownerId: owner.ownerId,
    publicationState: (merged.publicationState ?? "draft") as any,
    adLicenseStatus: merged.adLicenseStatus,
  });

  await ctx.db.patch(id, {
    ...normalizedPatch,
    heroImage,
    searchText,
    ...projections,
    updatedAt: Date.now(),
  });
  await ensureProjectDossierForProperty(ctx, id, {
    includeLegacyUnitAndPaymentPlan: false,
    requestedVisibility,
  });
  await recomputeProjectReadinessForProperty(ctx, id);
  if (existing.publicationState !== merged.publicationState) {
    await applyOrganizationProjectSummaryDelta(ctx, {
      ownerField: owner.ownerField,
      ownerId: owner.ownerId,
      previousPublicationState: existing.publicationState as any,
      nextPublicationState: merged.publicationState as any,
    });
  }
}

/**
 * WHY:   Delete semantics should stay identical across owner-scoped property surfaces.
 * WHAT:  Deletes one property by id after existence verification.
 * HOW:   Reuses the shared existence guard and removes the record.
 */
export async function deleteOwnerScopedProperty(
  ctx: MutationCtx,
  args: { id: OwnerScopedPropertyUpdateArgs["id"] },
) {
  const existing = await requirePropertyRecord(ctx, args.id);
  const owner = resolveOwnerState(existing as any);
  await ctx.db.delete(args.id);
  await applyOrganizationProjectSummaryDelta(ctx, {
    ownerField: owner.ownerField,
    ownerId: owner.ownerId,
    previousPublicationState: existing.publicationState as any,
    delta: -1,
  });
}

/**
 * WHY:   Publication-state changes should use one shared write path across broker and RED modules.
 * WHAT:  Marks a property as published by id.
 * HOW:   Verifies existence and patches `publicationState`.
 */
export async function publishOwnerScopedProperty(
  ctx: MutationCtx,
  args: { id: OwnerScopedPropertyUpdateArgs["id"] },
) {
  const existing = await requirePropertyRecord(ctx, args.id);
  const owner = resolveOwnerState(existing as any);
  await ensureProjectDossierForProperty(ctx, args.id, {
    includeLegacyUnitAndPaymentPlan: false,
    requestedVisibility: "public",
  });
  const readiness = await recomputeProjectReadinessForProperty(ctx, args.id);
  if (!readiness.canPublish) {
    throw new ConvexError({
      code: "PROJECT_READINESS_REQUIRED",
      message: readiness.blockers[0]?.label ?? "Project readiness approval is required before publishing",
      details: readiness.blockers,
    } as any);
  }
  const projections = await buildPropertyProjectionFields(ctx, {
    ownerField: owner.ownerField,
    ownerId: owner.ownerId,
    publicationState: "published",
    adLicenseStatus: existing.adLicenseStatus,
    projectReadinessStatus: readiness.status,
  });
  await ctx.db.patch(args.id, {
    publicationState: "published",
    projectReadinessStatus: readiness.status,
    ...projections,
    updatedAt: Date.now(),
  });
  await applyOrganizationProjectSummaryDelta(ctx, {
    ownerField: owner.ownerField,
    ownerId: owner.ownerId,
    previousPublicationState: existing.publicationState as any,
    nextPublicationState: "published",
  });
  return { ok: true } as const;
}

/**
 * WHY:   Broker and RED overview repositories currently differ only by owner field.
 * WHAT:  Counts properties for the provided owner field.
 * HOW:   Reuses the indexed owner query and returns the total count.
 */
export async function countOwnerScopedProperties(
  ctx: QueryCtx,
  args: {
    ownerField: OwnerScopedOwnerField;
    ownerId: OwnerScopedOwnerId;
  },
) {
  const summaryIndex = args.ownerField === "brokerId" ? "ownerBrokerId" : "ownerREDId";
  const summary = await ctx.db
    .query("organizationProjectSummaries")
    .withIndex(summaryIndex, (q: any) => q.eq(summaryIndex, args.ownerId))
    .first();
  if (!summary) {
    // Allow legacy rows to keep working until the org summary backfill has run.
    const legacyRows = await buildOwnerScopedQuery(ctx, args.ownerField, args.ownerId).collect();
    return {
      properties: legacyRows.length,
    };
  }
  return {
    properties: summary?.propertyCount ?? 0,
  };
}

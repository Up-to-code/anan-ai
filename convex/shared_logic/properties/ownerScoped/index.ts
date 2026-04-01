import { ConvexError } from "convex/values";
import type { PaginationOptions } from "convex/server";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";
import { buildPropertySearchText } from "../searchText";
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
    .withIndex(ownerField, (q: any) => q.eq(ownerField, ownerId));
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
    return query
      .filter((q) => q.eq(q.field("status"), args.status))
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
  return ctx.db.get(args.id);
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
  const heroImage = rest.media?.[0];
  const searchText = buildPropertySearchText(rest);

  return ctx.db.insert("properties", {
    ...rest,
    heroImage,
    searchText,
    [ownerField]: ownerId,
    publicationState: rest.publicationState ?? "draft",
  } as any);
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
  const heroImage = patch.media?.[0] ?? existing.heroImage;
  const merged = { ...existing, ...patch, heroImage };
  const searchText = buildPropertySearchText(merged);

  await ctx.db.patch(id, {
    ...patch,
    heroImage,
    searchText,
  });
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
  await requirePropertyRecord(ctx, args.id);
  await ctx.db.delete(args.id);
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
  await requirePropertyRecord(ctx, args.id);
  await ctx.db.patch(args.id, { publicationState: "published" });
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
  const properties = await buildOwnerScopedQuery(ctx, args.ownerField, args.ownerId).collect();
  return {
    properties: properties.length,
  };
}

import type { PaginationOptions } from "convex/server";
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import {
  createOwnerScopedProperty,
  deleteOwnerScopedProperty,
  getOwnerScopedPropertyById,
  listOwnerScopedProperties,
  publishOwnerScopedProperty,
  updateOwnerScopedProperty,
} from "../../shared_logic/properties/ownerScoped";
import type {
  OwnerScopedPropertyUpdateArgs,
  PropertyStatus,
  RedPropertyCreateArgs,
} from "../../shared_logic/properties/types";

/**
 * WHY:   The Next.js developer server layer needs a low-level property listing primitive by RED owner id.
 * WHAT:  Lists RED-owned properties with optional status filtering and pagination.
 * HOW:   Queries the `properties` table by `REDId` and applies status filtering when requested.
 */
export async function listPropertiesByRedId(
  ctx: QueryCtx,
  {
    paginationOpts,
    status,
    REDId,
  }: {
    paginationOpts: PaginationOptions;
    status?: PropertyStatus;
    REDId: Id<"RED">;
  },
) {
  return listOwnerScopedProperties(ctx, {
    paginationOpts,
    status,
    ownerField: "REDId",
    ownerId: REDId,
  });
}

/**
 * WHY:   Application services must be able to load a property record before doing ownership checks in Next.js.
 * WHAT:  Returns a property document by id without applying role or owner authorization.
 * HOW:   Reads the property directly from the database.
 */
export async function getRedPropertyById(ctx: QueryCtx, { id }: { id: Id<"properties"> }) {
  return getOwnerScopedPropertyById(ctx, { id });
}

/**
 * WHY:   RED property creation should persist only the write-side data concerns inside Convex.
 * WHAT:  Inserts a new RED-owned property and computes its derived search text.
 * HOW:   Builds `searchText`, stamps `publicationState=draft`, and inserts the document.
 */
export async function createRedProperty(ctx: MutationCtx, args: RedPropertyCreateArgs) {
  return createOwnerScopedProperty(ctx, {
    ...args,
    ownerField: "REDId",
    ownerId: args.REDId,
  });
}

/**
 * WHY:   RED property updates should remain a pure persistence concern once ownership is enforced upstream.
 * WHAT:  Patches a property by id and refreshes the derived search text.
 * HOW:   Loads the existing document, merges the patch, rebuilds `searchText`, and applies the patch.
 */
export async function updateRedProperty(
  ctx: MutationCtx,
  args: OwnerScopedPropertyUpdateArgs,
) {
  await updateOwnerScopedProperty(ctx, args);
}

/**
 * WHY:   RED property deletion should not duplicate upstream authorization logic.
 * WHAT:  Deletes a property by id.
 * HOW:   Confirms the property exists, then deletes it.
 */
export async function deleteRedProperty(ctx: MutationCtx, { id }: { id: Id<"properties"> }) {
  await deleteOwnerScopedProperty(ctx, { id });
}

/**
 * WHY:   Publishing a RED property is still a data mutation, but policy enforcement belongs in Next.js.
 * WHAT:  Marks a property as published by id.
 * HOW:   Confirms the property exists, then patches `publicationState`.
 */
export async function publishRedProperty(
  ctx: MutationCtx,
  { id }: { id: Id<"properties"> },
) {
  return publishOwnerScopedProperty(ctx, { id });
}

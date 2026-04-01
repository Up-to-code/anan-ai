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
  BrokerPropertyCreateArgs,
  OwnerScopedPropertyUpdateArgs,
  PropertyStatus,
} from "../../shared_logic/properties/types";

/**
 * WHY:   The Next.js broker server layer needs a low-level property listing primitive by owner id.
 * WHAT:  Lists broker-owned properties with optional status filtering and pagination.
 * HOW:   Queries the `properties` table by `brokerId` and applies status filtering when requested.
 */
export async function listPropertiesByBrokerId(
  ctx: QueryCtx,
  {
    paginationOpts,
    status,
    brokerId,
  }: {
    paginationOpts: PaginationOptions;
    status?: PropertyStatus;
    brokerId: Id<"brokers">;
  },
) {
  return listOwnerScopedProperties(ctx, {
    paginationOpts,
    status,
    ownerField: "brokerId",
    ownerId: brokerId,
  });
}

/**
 * WHY:   Application services must be able to load a property record before doing ownership checks in Next.js.
 * WHAT:  Returns a property document by id without applying role or owner authorization.
 * HOW:   Reads the property directly from the database.
 */
export async function getBrokerPropertyById(ctx: QueryCtx, { id }: { id: Id<"properties"> }) {
  return getOwnerScopedPropertyById(ctx, { id });
}

/**
 * WHY:   Broker property creation should persist only the write-side data concerns inside Convex.
 * WHAT:  Inserts a new broker-owned property and computes its derived search text.
 * HOW:   Builds `searchText`, stamps `publicationState=draft`, and inserts the document.
 */
export async function createBrokerProperty(ctx: MutationCtx, args: BrokerPropertyCreateArgs) {
  return createOwnerScopedProperty(ctx, {
    ...args,
    ownerField: "brokerId",
    ownerId: args.brokerId,
  });
}

/**
 * WHY:   Broker property updates should remain a pure persistence concern once ownership is enforced upstream.
 * WHAT:  Patches a property by id and refreshes the derived search text.
 * HOW:   Loads the existing document, merges the patch, rebuilds `searchText`, and applies the patch.
 */
export async function updateBrokerProperty(
  ctx: MutationCtx,
  args: OwnerScopedPropertyUpdateArgs,
) {
  await updateOwnerScopedProperty(ctx, args);
}

/**
 * WHY:   Broker property deletion should not duplicate upstream authorization logic.
 * WHAT:  Deletes a property by id.
 * HOW:   Confirms the property exists, then deletes it.
 */
export async function deleteBrokerProperty(ctx: MutationCtx, { id }: { id: Id<"properties"> }) {
  await deleteOwnerScopedProperty(ctx, { id });
}

/**
 * WHY:   Publishing a broker property is still a data mutation, but policy enforcement belongs in Next.js.
 * WHAT:  Marks a property as published by id.
 * HOW:   Confirms the property exists, then patches `publicationState`.
 */
export async function publishBrokerProperty(
  ctx: MutationCtx,
  { id }: { id: Id<"properties"> },
) {
  return publishOwnerScopedProperty(ctx, { id });
}

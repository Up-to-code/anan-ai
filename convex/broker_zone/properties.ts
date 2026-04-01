import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  optionalPropertyStatusValidator,
  ownerScopedPropertyCreateFields,
  ownerScopedPropertyUpdateFields,
} from "../shared_logic/properties/types/validation";
import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerPropertyById,
  listPropertiesByBrokerId,
  publishBrokerProperty,
  updateBrokerProperty,
} from "./repositories/propertiesRepository";

async function requireBrokerOwnerAccess(ctx: any, brokerId?: string) {
  const access = await requireRole(ctx, ["broker"]);
  if (!access.brokerId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Broker profile not linked" });
  }
  if (brokerId && brokerId !== access.brokerId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access another broker organization" });
  }
  return access;
}

async function requireBrokerOwnedProperty(ctx: any, propertyId: any) {
  const access = await requireBrokerOwnerAccess(ctx);
  const property = await getBrokerPropertyById(ctx, { id: propertyId });
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  if (property.brokerId !== access.brokerId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access another broker property" });
  }
  return { access, property };
}

/**
 * WHY:   Broker server functions need a private Convex query for broker-owned property pagination.
 * WHAT:  Lists properties for a broker owner id with optional status filtering.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const listByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
    paginationOpts: paginationOptsValidator,
    status: optionalPropertyStatusValidator,
  },
  handler: async (ctx, args) => {
    const access = await requireBrokerOwnerAccess(ctx, args.brokerId);
    return await listPropertiesByBrokerId(ctx, { ...args, brokerId: access.brokerId! });
  },
});

/**
 * WHY:   Broker server functions need a private Convex query for property reads by id.
 * WHAT:  Returns the property document for the provided id.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const { property } = await requireBrokerOwnedProperty(ctx, args.id);
    return property;
  },
});

/**
 * WHY:   Broker server functions need a private Convex mutation for broker property creation.
 * WHAT:  Persists a broker-owned property using the provided owner id and property payload.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const create = mutation({
  args: {
    brokerId: v.id("brokers"),
    ...ownerScopedPropertyCreateFields,
  },
  handler: async (ctx, args) => {
    const access = await requireBrokerOwnerAccess(ctx, args.brokerId);
    return await createBrokerProperty(ctx, { ...args, brokerId: access.brokerId! });
  },
});

/**
 * WHY:   Broker server functions need a private Convex mutation for broker property updates.
 * WHAT:  Patches a property by id and refreshes its derived search text.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const update = mutation({
  args: {
    ...ownerScopedPropertyUpdateFields,
  },
  handler: async (ctx, args) => {
    await requireBrokerOwnedProperty(ctx, args.id);
    return await updateBrokerProperty(ctx, args);
  },
});

/**
 * WHY:   Broker server functions need a private Convex mutation for broker property deletion.
 * WHAT:  Deletes a property by id.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireBrokerOwnedProperty(ctx, args.id);
    return await deleteBrokerProperty(ctx, args);
  },
});

/**
 * WHY:   Broker server functions need a private Convex mutation for publication-state changes.
 * WHAT:  Marks a property as published by id.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const publish = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireBrokerOwnedProperty(ctx, args.id);
    return await publishBrokerProperty(ctx, args);
  },
});

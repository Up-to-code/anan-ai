import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { uploadedFileReferenceListValidator } from "../shared_logic/files";
import {
  createBrokerProperty,
  deleteBrokerProperty,
  getBrokerPropertyById,
  listPropertiesByBrokerId,
  publishBrokerProperty,
  updateBrokerProperty,
} from "./repositories/propertiesRepository";

const statusValidator = v.optional(
  v.union(v.literal("available"), v.literal("sold"), v.literal("reserved")),
);

/**
 * WHY:   Broker server functions need a private Convex query for broker-owned property pagination.
 * WHAT:  Lists properties for a broker owner id with optional status filtering.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const listByBrokerId = query({
  args: {
    brokerId: v.id("brokers"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    return await listPropertiesByBrokerId(ctx, args);
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
    return await getBrokerPropertyById(ctx, args);
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
    title: v.string(),
    address: v.string(),
    price: v.number(),
    beds: v.number(),
    baths: v.number(),
    sqft: v.optional(v.number()),
    description: v.string(),
    location: v.optional(v.string()),
    area: v.optional(v.string()),
    status: v.optional(statusValidator),
    bankId: v.optional(v.id("banks")),
    media: v.optional(uploadedFileReferenceListValidator),
  },
  handler: async (ctx, args) => {
    return await createBrokerProperty(ctx, args);
  },
});

/**
 * WHY:   Broker server functions need a private Convex mutation for broker property updates.
 * WHAT:  Patches a property by id and refreshes its derived search text.
 * HOW:   Delegates directly to the broker property repository service.
 */
export const update = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    price: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    sqft: v.optional(v.number()),
    description: v.optional(v.string()),
    location: v.optional(v.string()),
    area: v.optional(v.string()),
    status: v.optional(statusValidator),
    bankId: v.optional(v.id("banks")),
    media: v.optional(uploadedFileReferenceListValidator),
  },
  handler: async (ctx, args) => {
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
    return await publishBrokerProperty(ctx, args);
  },
});

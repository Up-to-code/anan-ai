import { mutation, query } from "../_generated/server";
import { ConvexError, v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { uploadedFileReferenceListValidator } from "../shared_logic/files";
import { requireRole } from "../_core/security/accessPolicy";
import {
  createRedProperty,
  deleteRedProperty,
  getRedPropertyById,
  listPropertiesByRedId,
  publishRedProperty,
  updateRedProperty,
} from "./repositories/propertiesRepository";

const statusValidator = v.optional(
  v.union(v.literal("available"), v.literal("sold"), v.literal("reserved")),
);
const publicationStateValidator = v.optional(
  v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
);

async function requireRedOwnerAccess(ctx: any, REDId?: string) {
  const access = await requireRole(ctx, ["developer"]);
  if (!access.REDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Developer (RED) profile not linked" });
  }
  if (REDId && REDId !== access.REDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access another developer organization" });
  }
  return access;
}

async function requireRedOwnedProperty(ctx: any, propertyId: any) {
  const access = await requireRedOwnerAccess(ctx);
  const property = await getRedPropertyById(ctx, { id: propertyId });
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  if (property.REDId !== access.REDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access another developer property" });
  }
  return { access, property };
}

/**
 * WHY:   Developer server functions need a private Convex query for RED-owned property pagination.
 * WHAT:  Lists properties for a RED owner id with optional status filtering.
 * HOW:   Delegates directly to the RED property repository service.
 */
export const listByRedId = query({
  args: {
    REDId: v.id("RED"),
    paginationOpts: paginationOptsValidator,
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    const access = await requireRedOwnerAccess(ctx, args.REDId);
    return await listPropertiesByRedId(ctx, { ...args, REDId: access.REDId! });
  },
});

/**
 * WHY:   Developer server functions need a private Convex query for property reads by id.
 * WHAT:  Returns the property document for the provided id.
 * HOW:   Delegates directly to the RED property repository service.
 */
export const getById = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const { property } = await requireRedOwnedProperty(ctx, args.id);
    return property;
  },
});

/**
 * WHY:   Developer server functions need a private Convex mutation for RED property creation.
 * WHAT:  Persists a RED-owned property using the provided owner id and property payload.
 * HOW:   Delegates directly to the RED property repository service.
 */
export const create = mutation({
  args: {
    REDId: v.id("RED"),
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
    body: v.optional(v.any()),
    adLicenseNumber: v.optional(v.string()),
    publicationState: publicationStateValidator,
  },
  handler: async (ctx, args) => {
    const access = await requireRedOwnerAccess(ctx, args.REDId);
    return await createRedProperty(ctx, { ...args, REDId: access.REDId! });
  },
});

/**
 * WHY:   Developer server functions need a private Convex mutation for RED property updates.
 * WHAT:  Patches a property by id and refreshes its derived search text.
 * HOW:   Delegates directly to the RED property repository service.
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
    body: v.optional(v.any()),
    adLicenseNumber: v.optional(v.string()),
    publicationState: publicationStateValidator,
  },
  handler: async (ctx, args) => {
    await requireRedOwnedProperty(ctx, args.id);
    return await updateRedProperty(ctx, args);
  },
});

/**
 * WHY:   Developer server functions need a private Convex mutation for RED property deletion.
 * WHAT:  Deletes a property by id.
 * HOW:   Delegates directly to the RED property repository service.
 */
export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireRedOwnedProperty(ctx, args.id);
    return await deleteRedProperty(ctx, args);
  },
});

/**
 * WHY:   Developer server functions need a private Convex mutation for publication-state changes.
 * WHAT:  Marks a property as published by id.
 * HOW:   Delegates directly to the RED property repository service.
 */
export const publish = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireRedOwnedProperty(ctx, args.id);
    return await publishRedProperty(ctx, args);
  },
});

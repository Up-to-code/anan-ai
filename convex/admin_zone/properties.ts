import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  listPropertiesService,
  getPropertyService,
  createPropertyService,
  updatePropertyService,
  deletePropertyService,
} from "./services/propertiesService";

const statusValidator = v.optional(
  v.union(v.literal("available"), v.literal("sold"), v.literal("reserved"))
);

export const listProperties = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(statusValidator),
    REDId: v.optional(v.id("RED")),
    brokerId: v.optional(v.id("brokers")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await listPropertiesService(ctx, args);
  },
});

export const getProperty = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await getPropertyService(ctx, args);
  },
});

const createPropertyArgs = {
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
  REDId: v.optional(v.id("RED")),
  brokerId: v.optional(v.id("brokers")),
};

export const createProperty = mutation({
  args: createPropertyArgs,
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await createPropertyService(ctx, args);
  },
});

export const updateProperty = mutation({
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
    REDId: v.optional(v.id("RED")),
    brokerId: v.optional(v.id("brokers")),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await updatePropertyService(ctx, args);
  },
});

export const deleteProperty = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await deletePropertyService(ctx, args);
  },
});

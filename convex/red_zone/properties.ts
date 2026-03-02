import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { REDChecker } from "../shared_logic/lib/REDChecker";
import { requireVerifiedForPublishRED } from "../shared_logic/lib/publishGuards";
import {
  listMyPropertiesService,
  getPropertyService,
  createPropertyService,
  updatePropertyService,
  deletePropertyService,
  publishPropertyService,
} from "./services/propertiesService";

const statusValidator = v.optional(
  v.union(v.literal("available"), v.literal("sold"), v.literal("reserved")),
);

export const listMyProperties = query({
  args: {
    paginationOpts: paginationOptsValidator,
    status: v.optional(statusValidator),
  },
  handler: async (ctx, args) => {
    const { REDId } = await REDChecker(ctx);
    return await listMyPropertiesService(ctx, { ...args, REDId });
  },
});

export const getProperty = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const { REDId } = await REDChecker(ctx);
    return await getPropertyService(ctx, { ...args, REDId });
  },
});

export const createProperty = mutation({
  args: {
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
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { REDId } = await REDChecker(ctx);
    return await createPropertyService(ctx, { ...args, REDId });
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
    imageIds: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const { REDId } = await REDChecker(ctx);
    return await updatePropertyService(ctx, { ...args, REDId });
  },
});

export const deleteProperty = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const { REDId } = await REDChecker(ctx);
    return await deletePropertyService(ctx, { ...args, REDId });
  },
});

export const publishProperty = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    const { REDId } = await requireVerifiedForPublishRED(ctx);
    return await publishPropertyService(ctx, { ...args, REDId });
  },
});

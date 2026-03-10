import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  listUsersService,
  getUserDetailService,
  getUserKnowledgeResearchService,
  getUserSearchLogsService,
  getUserAgentMemoryService,
  updateUserService
} from "./services/usersService";

export const listUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channel: v.optional(
      v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await listUsersService(ctx, args);
  },
});

export const getUserDetail = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await getUserDetailService(ctx, args);
  },
});

export const getUserKnowledgeResearch = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await getUserKnowledgeResearchService(ctx, { userId: args.userId, limit: args.limit ?? 20 });
  },
});

export const getUserSearchLogs = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await getUserSearchLogsService(ctx, { userId: args.userId, limit: args.limit ?? 50 });
  },
});

export const getUserAgentMemory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await getUserAgentMemoryService(ctx, args);
  },
});

export const updateUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    channel: v.optional(
      v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))
    ),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return await updateUserService(ctx, args);
  },
});

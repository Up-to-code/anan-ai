import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../_core/security/accessPolicy";
import {
  getUserAgentMemoryService,
  getUserKnowledgeResearchService,
  getUserSearchLogsService,
  listUsersService,
  updateUserService,
} from "./services/usersService";
import { getAdminUserDetailArgs, getAdminUserDetailHandler } from "./users/getAdminUserDetailHandler";
import { listAdminMembershipsArgs, listAdminMembershipsHandler } from "./users/listAdminMemberships";
import { listAdminProfilesArgs, listAdminProfilesHandler } from "./users/listAdminProfiles";
import { listAdminUserVerificationArgs, listAdminUserVerificationHandler } from "./users/listAdminUserVerification";
import { listAdminUsersArgs, listAdminUsersHandler } from "./users/listAdminUsers";

export const listAdminUsers = query({
  args: listAdminUsersArgs,
  handler: listAdminUsersHandler,
});

export const listAdminProfiles = query({
  args: listAdminProfilesArgs,
  handler: listAdminProfilesHandler,
});

export const listAdminMemberships = query({
  args: listAdminMembershipsArgs,
  handler: listAdminMembershipsHandler,
});

export const listAdminUserVerification = query({
  args: listAdminUserVerificationArgs,
  handler: listAdminUserVerificationHandler,
});

export const getAdminUserDetail = query({
  args: getAdminUserDetailArgs,
  handler: getAdminUserDetailHandler,
});

/**
 * WHY:   Existing admin screens still depend on the older raw channel-user list query.
 * WHAT:  Returns the previous channel-user pagination result filtered by channel.
 * HOW:   Delegates to the legacy service implementation for backward compatibility.
 */
export const listUsers = query({
  args: {
    paginationOpts: paginationOptsValidator,
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return listUsersService(ctx, args);
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to knowledge research rows by user id.
 * WHAT:  Returns recent knowledge research entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserKnowledgeResearch = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserKnowledgeResearchService(ctx, { userId: args.userId, limit: args.limit ?? 20 });
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to search logs by user id.
 * WHAT:  Returns recent search log entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserSearchLogs = query({
  args: { userId: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserSearchLogsService(ctx, { userId: args.userId, limit: args.limit ?? 50 });
  },
});

/**
 * WHY:   Existing admin loaders still need direct access to agent-memory rows by user id.
 * WHAT:  Returns agent memory entries for a user.
 * HOW:   Delegates to the legacy users service helper.
 */
export const getUserAgentMemory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return getUserAgentMemoryService(ctx, args);
  },
});

/**
 * WHY:   Admin operators still need to patch editable channel-user fields.
 * WHAT:  Updates display name and channel for a channel user row.
 * HOW:   Delegates to the existing mutation helper.
 */
export const updateUser = mutation({
  args: {
    userId: v.string(),
    displayName: v.optional(v.string()),
    channel: v.optional(v.union(v.literal("whatsapp"), v.literal("app"), v.literal("web"))),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["admin"]);
    return updateUserService(ctx, args);
  },
});


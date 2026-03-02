import { mutation, query } from "../../_generated/server";
import { v } from "convex/values";
import {
  acceptTeamInviteService,
  cancelTeamInviteService,
  createTeamInviteService,
  getMyAgencyService,
  listTeamInvitesService,
  listTeamMembersService,
} from "./services/agenciesService";

export const getMyAgency = query({
  args: {},
  handler: async (ctx) => {
    return getMyAgencyService(ctx);
  },
});

export const getTeamMembers = query({
  args: {},
  handler: async (ctx) => {
    return listTeamMembersService(ctx);
  },
});

export const listTeamInvites = query({
  args: {},
  handler: async (ctx) => {
    return listTeamInvitesService(ctx);
  },
});

export const createTeamInvite = mutation({
  args: {
    email: v.string(),
    role: v.union(v.literal("manager"), v.literal("member"), v.literal("viewer")),
  },
  handler: async (ctx, args) => {
    return createTeamInviteService(ctx, args);
  },
});

export const cancelTeamInvite = mutation({
  args: {
    inviteId: v.id("teamInvites"),
  },
  handler: async (ctx, args) => {
    return cancelTeamInviteService(ctx, args);
  },
});

export const acceptTeamInvite = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    return acceptTeamInviteService(ctx, args);
  },
});

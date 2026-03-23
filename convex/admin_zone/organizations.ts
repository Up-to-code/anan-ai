import { mutation, query } from "../_generated/server";
import { v } from "convex/values";
import { requireRole } from "../_core/security/accessPolicy";
import { cascadingDelete } from "../cascading";
import { api } from "../_generated/api";
import { auditLog } from "../auditLog";
import { getOrganizationDetailArgs, getOrganizationDetailHandler } from "./organizations/getOrganizationDetail";
import { listBrokerOrganizationsArgs, listBrokerOrganizationsHandler } from "./organizations/listBrokerOrganizations";
import { listDeveloperOrganizationsArgs, listDeveloperOrganizationsHandler } from "./organizations/listDeveloperOrganizations";
import { listOrganizationInvitesArgs, listOrganizationInvitesHandler } from "./organizations/listOrganizationInvites";
import { listOrganizationMembershipsArgs, listOrganizationMembershipsHandler } from "./organizations/listOrganizationMemberships";

export const listBrokerOrganizations = query({
  args: listBrokerOrganizationsArgs,
  handler: listBrokerOrganizationsHandler,
});

export const listDeveloperOrganizations = query({
  args: listDeveloperOrganizationsArgs,
  handler: listDeveloperOrganizationsHandler,
});

export const listOrganizationMemberships = query({
  args: listOrganizationMembershipsArgs,
  handler: listOrganizationMembershipsHandler,
});

export const listOrganizationInvites = query({
  args: listOrganizationInvitesArgs,
  handler: listOrganizationInvitesHandler,
});

export const getOrganizationDetail = query({
  args: getOrganizationDetailArgs,
  handler: getOrganizationDetailHandler,
});

/**
 * WHY:   Admin tooling needs a safe way to remove broker organizations and related records.
 * WHAT:  Cascades deletion across subscriptions and tenant links for brokers.
 * HOW:   Uses the cascading delete component with batched processing.
 */
export const deleteBrokerOrganization = mutation({
  args: { brokerId: v.id("brokers") },
  handler: async (ctx, args) => {
    const access = await requireRole(ctx, ["admin"]);
    const broker = await ctx.db.get(args.brokerId);
    const result = await cascadingDelete.deleteWithCascadeBatched(ctx, "brokers", args.brokerId, {
      batchHandlerRef: api.cascading._cascadeBatchHandler,
      batchSize: 2000,
    });

    await auditLog.logChange(ctx, {
      action: "broker.deleted",
      actorId: access.authUserId,
      resourceType: "brokers",
      resourceId: args.brokerId,
      before: broker,
      after: null,
      generateDiff: false,
      severity: "warning",
      tags: ["organizations", "delete"],
    });

    return result;
  },
});

/**
 * WHY:   Admin tooling needs a safe way to remove RED organizations and related records.
 * WHAT:  Cascades deletion across subscriptions and tenant links for RED organizations.
 * HOW:   Uses the cascading delete component with batched processing.
 */
export const deleteDeveloperOrganization = mutation({
  args: { redId: v.id("RED") },
  handler: async (ctx, args) => {
    const access = await requireRole(ctx, ["admin"]);
    const red = await ctx.db.get(args.redId);
    const result = await cascadingDelete.deleteWithCascadeBatched(ctx, "RED", args.redId, {
      batchHandlerRef: api.cascading._cascadeBatchHandler,
      batchSize: 2000,
    });

    await auditLog.logChange(ctx, {
      action: "red.deleted",
      actorId: access.authUserId,
      resourceType: "RED",
      resourceId: args.redId,
      before: red,
      after: null,
      generateDiff: false,
      severity: "warning",
      tags: ["organizations", "delete"],
    });

    return result;
  },
});


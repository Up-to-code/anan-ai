import { query } from "../_generated/server";
import { v } from "convex/values";
import { requireAdminAccess } from "../_core/security/accessPolicy";
import { tenants } from "../tenants";

export const brokerAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireAdminAccess(ctx);
    const [brokers, profiles, tenantLinks, projectSummaries] = await Promise.all([
      ctx.db.query("brokers").order("desc").take(500),
      ctx.db.query("userProfiles").order("desc").take(500),
      ctx.db.query("tenantOrgLinks").order("desc").take(500),
      ctx.db.query("organizationProjectSummaries").collect(),
    ]);
    const tenantOrgIdByBrokerId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerBrokerId) {
        tenantOrgIdByBrokerId.set(String(link.ownerBrokerId), link.tenantOrgId);
      }
    }
    const inventoryByBrokerId = new Map(
      projectSummaries
        .filter((summary) => summary.ownerBrokerId)
        .map((summary) => [String(summary.ownerBrokerId), summary.propertyCount]),
    );
    const topByInventory = (await Promise.all(
      brokers.map(async (broker) => {
        const tenantOrgId = tenantOrgIdByBrokerId.get(String(broker._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];
        return {
          id: String(broker._id),
          name: broker.name,
          status: broker.status ?? "pending",
          isVerified: broker.isVerified === true,
          linkedProfilesCount: profiles.filter((profile) => profile.brokerId === broker._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          inventoryCount: inventoryByBrokerId.get(String(broker._id)) ?? 0,
        };
      }),
    ))
      .sort((left, right) => right.inventoryCount - left.inventoryCount)
      .slice(0, limit);
    return {
      summary: {
        total: brokers.length,
        verified: brokers.filter((broker) => broker.isVerified === true).length,
        pending: brokers.filter((broker) => broker.status === "pending").length,
      },
      topByInventory,
    };
  },
});

export const developerAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 10 }) => {
    await requireAdminAccess(ctx);
    const [developers, profiles, tenantLinks, projectSummaries] = await Promise.all([
      ctx.db.query("RED").order("desc").take(500),
      ctx.db.query("userProfiles").order("desc").take(500),
      ctx.db.query("tenantOrgLinks").order("desc").take(500),
      ctx.db.query("organizationProjectSummaries").collect(),
    ]);
    const tenantOrgIdByRedId = new Map<string, string>();
    for (const link of tenantLinks) {
      if (link.ownerREDId) {
        tenantOrgIdByRedId.set(String(link.ownerREDId), link.tenantOrgId);
      }
    }
    const inventoryByRedId = new Map(
      projectSummaries
        .filter((summary) => summary.ownerREDId)
        .map((summary) => [String(summary.ownerREDId), summary.propertyCount]),
    );
    const topByInventory = (await Promise.all(
      developers.map(async (developer) => {
        const tenantOrgId = tenantOrgIdByRedId.get(String(developer._id));
        const members = tenantOrgId ? await tenants.listMembers(ctx as never, tenantOrgId) : [];
        return {
          id: String(developer._id),
          name: developer.name,
          status: developer.status ?? "pending",
          isVerified: developer.isVerified === true,
          linkedProfilesCount: profiles.filter((profile) => profile.developerId === developer._id).length,
          membersCount: members.filter((member) => (member.status ?? "active") === "active").length,
          inventoryCount: inventoryByRedId.get(String(developer._id)) ?? 0,
        };
      }),
    ))
      .sort((left, right) => right.inventoryCount - left.inventoryCount)
      .slice(0, limit);
    return {
      summary: {
        total: developers.length,
        verified: developers.filter((developer) => developer.isVerified === true).length,
        pending: developers.filter((developer) => developer.status === "pending").length,
      },
      topByInventory,
    };
  },
});

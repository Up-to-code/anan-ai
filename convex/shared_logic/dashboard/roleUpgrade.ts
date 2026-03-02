import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import { authComponent, createAuth } from "../../_core/auth";
import { components } from "../../_generated/api";

/**
 * Upgrade a user (role=user) to broker. Creates a new broker and links via userProfiles.
 * Only for users with role "user".
 */
export const upgradeToBroker = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, { name: brokerName }) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Authentication required");
    }
    const authUserId = (authUser as { userId?: string }).userId ?? String((authUser as { _id?: string })?._id ?? "");
    const role = (authUser as { role?: string })?.role ?? "user";
    if (role !== "user") {
      throw new Error("Only users can upgrade to broker");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
      .first();
    if (existing?.brokerId) {
      await ctx.db.patch(existing._id, { role: "broker" });
      return { ok: true, brokerId: existing.brokerId };
    }

    const slug = `${authUserId.slice(0, 8)}-broker`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const brokerId = await ctx.db.insert("brokers", {
      name: brokerName ?? (authUser as { name?: string })?.name ?? "My Brokerage",
      slug,
      status: "active",
      isVerified: false,
    });

    if (existing) {
      await ctx.db.patch(existing._id, { brokerId, role: "broker", isActive: true });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId,
        brokerId,
        role: "broker",
        isActive: true,
      });
    }

    return { ok: true, brokerId };
  },
});

/**
 * Upgrade a user (role=user) to RED (Real Estate Developer). Creates a new RED and links via userProfiles.
 * Only for users with role "user".
 */
export const upgradeToRED = mutation({
  args: {
    name: v.optional(v.string()),
  },
  handler: async (ctx, { name: redName }) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Authentication required");
    }
    const authUserId = (authUser as { userId?: string }).userId ?? String((authUser as { _id?: string })?._id ?? "");
    const role = (authUser as { role?: string })?.role ?? "user";
    if (role !== "user") {
      throw new Error("Only users can upgrade to RED");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
      .first();
    if (existing?.REDId) {
      await ctx.db.patch(existing._id, { role: "RED" });
      return { ok: true, REDId: existing.REDId };
    }

    const slug = `${authUserId.slice(0, 8)}-red`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const REDId = await ctx.db.insert("RED", {
      name: redName ?? (authUser as { name?: string })?.name ?? "My Real Estate Development",
      slug,
      status: "active",
      isVerified: false,
    });

    if (existing) {
      await ctx.db.patch(existing._id, { REDId, role: "RED", isActive: true });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId,
        REDId,
        role: "RED",
        isActive: true,
      });
    }

    return { ok: true, REDId };
  },
});

/**
 * Upgrade a user (role=user) to normal user.
 * Only for users with role "user".
 */
export const upgradeToNormal = mutation({
  args: {},
  handler: async (ctx) => {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) {
      throw new Error("Authentication required");
    }
    const role = (authUser as { role?: string })?.role ?? "user";
    if (role !== "user") {
      throw new Error("Only users can upgrade to normal");
    }

    const authUserId = (authUser as { userId?: string }).userId ?? String((authUser as { _id?: string })?._id ?? "");
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { role: "normal", isActive: true });
    } else {
      await ctx.db.insert("userProfiles", {
        authUserId,
        role: "normal",
        isActive: true,
      });
    }

    return { ok: true };
  },
});

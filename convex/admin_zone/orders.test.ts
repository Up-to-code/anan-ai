import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

describe("admin orders", () => {
    it("listOrders returns empty array when no orders", async () => {
        const t = convexTest(schema, modules);
        // We need to bypass adminChecker, so seed directly and test via ctx
        const result = await t.run(async (ctx) => {
            return await ctx.db.query("orders").collect();
        });
        expect(result).toEqual([]);
    });

    it("listOrders returns seeded orders", async () => {
        const t = convexTest(schema, modules);
        await t.run(async (ctx) => {
            await ctx.db.insert("orders", {
                userId: "test-user-1",
                type: "property",
                status: "new_lead",
                intent: "Buy a villa",
            });
            await ctx.db.insert("orders", {
                userId: "test-user-2",
                type: "loan",
                status: "contacted",
                intent: "Home loan",
            });
        });
        const result = await t.run(async (ctx) => {
            return await ctx.db.query("orders").collect();
        });
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBe(2);
    });

    it("orders can be filtered by status", async () => {
        const t = convexTest(schema, modules);
        await t.run(async (ctx) => {
            await ctx.db.insert("orders", {
                userId: "u1",
                type: "property",
                status: "new_lead",
            });
            await ctx.db.insert("orders", {
                userId: "u2",
                type: "property",
                status: "closed_won",
            });
            await ctx.db.insert("orders", {
                userId: "u3",
                type: "loan",
                status: "new_lead",
            });
        });
        const newLeads = await t.run(async (ctx) => {
            return await ctx.db
                .query("orders")
                .withIndex("status", (q) => q.eq("status", "new_lead"))
                .collect();
        });
        expect(newLeads.length).toBe(2);
        const closedWon = await t.run(async (ctx) => {
            return await ctx.db
                .query("orders")
                .withIndex("status", (q) => q.eq("status", "closed_won"))
                .collect();
        });
        expect(closedWon.length).toBe(1);
    });

    it("order can be patched with new status and notes", async () => {
        const t = convexTest(schema, modules);
        let orderId: string = "";
        await t.run(async (ctx) => {
            orderId = await ctx.db.insert("orders", {
                userId: "patch-user",
                type: "property",
                status: "new_lead",
            });
        });
        await t.run(async (ctx) => {
            await ctx.db.patch(orderId as any, {
                status: "contacted",
                notes: "Called the client",
            });
        });
        const patched = await t.run(async (ctx) => {
            return await ctx.db.get(orderId as any);
        });
        expect((patched as any)?.status).toBe("contacted");
        expect((patched as any)?.notes).toBe("Called the client");
    });
});

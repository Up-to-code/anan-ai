import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

describe("users service", () => {
    it("ensureWhatsAppUser creates a new user", async () => {
        const t = convexTest(schema, modules);
        const id = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966501234567",
            displayName: "Ahmed",
        } as never);
        expect(typeof id).toBe("string");
        expect((id as string).length).toBeGreaterThan(0);
    });

    it("ensureWhatsAppUser returns existing user ID on duplicate", async () => {
        const t = convexTest(schema, modules);
        const id1 = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966501234567",
            displayName: "Ahmed",
        } as never);
        const id2 = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966501234567",
            displayName: "Ahmed",
        } as never);
        expect(id1).toBe(id2);
    });

    it("ensureWhatsAppUser updates displayName on existing user", async () => {
        const t = convexTest(schema, modules);
        const id1 = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966509999999",
            displayName: "Old Name",
        } as never);
        const id2 = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966509999999",
            displayName: "New Name",
        } as never);
        expect(id1).toBe(id2);
        // Verify the displayName was updated
        const user = await t.run(async (ctx) => {
            return await ctx.db.get(id2 as never);
        });
        expect((user as { displayName: string })?.displayName).toBe("New Name");
    });

    it("ensureWhatsAppUser sets channel to whatsapp", async () => {
        const t = convexTest(schema, modules);
        const id = await t.mutation(api.shared_logic.services.users.ensureWhatsAppUser as never, {
            userId: "966507777777",
        } as never);
        const user = await t.run(async (ctx) => {
            return await ctx.db.get(id as never);
        });
        expect((user as { channel: string })?.channel).toBe("whatsapp");
    });
});

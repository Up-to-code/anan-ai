import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

describe("banks service", () => {
  it("getBySlug returns null when bank does not exist", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.shared_logic.services.banks.getBySlug as never, {
      slug: "nonexistent-bank",
    } as never);
    expect(result).toBeNull();
  });

  it("list returns empty array when no banks", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.shared_logic.services.banks.list as never, {} as never);
    expect(result).toEqual([]);
  });

  it("getBundles returns empty array when no banks", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.shared_logic.services.banks.getBundles as never, {} as never);
    expect(result).toEqual([]);
  });

  it("list returns banks when seeded", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("banks", {
        name: "Bank A",
        slug: "bank-a",
        contactEmail: "a@b.com",
      });
      await ctx.db.insert("banks", {
        name: "Bank B",
        slug: "bank-b",
        contactEmail: "b@b.com",
      });
    });
    const result = await t.query(api.shared_logic.services.banks.list as never, {} as never);
    expect(Array.isArray(result)).toBe(true);
    expect((result as unknown[]).length).toBeGreaterThanOrEqual(2);
  });

  it("getBySlug returns bank when seeded", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("banks", {
        name: "Test Bank",
        slug: "test-bank",
        contactEmail: "test@bank.com",
      });
    });
    const result = await t.query(api.shared_logic.services.banks.getBySlug as never, {
      slug: "test-bank",
    } as never);
    expect(result).not.toBeNull();
    expect((result as { slug: string })?.slug).toBe("test-bank");
    expect((result as { name: string })?.name).toBe("Test Bank");
  });
});

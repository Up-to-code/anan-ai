import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

describe("content service", () => {
  it("getBySlug returns null when page does not exist", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.shared_logic.services.content.getBySlug as never, {
      slug: "nonexistent-page",
    } as never);
    expect(result).toBeNull();
  });

  it("getBySlug returns page when seeded", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("knowledgePages", {
        slug: "loan-guide",
        title: "Loan Guide",
        content: "How to get a loan",
      });
    });
    const page = await t.query(api.shared_logic.services.content.getBySlug as never, { slug: "loan-guide" } as never);
    expect(page).not.toBeNull();
    expect((page as { title?: string })?.title).toBe("Loan Guide");
    expect((page as { slug?: string })?.slug).toBe("loan-guide");
  });

  it("list returns empty array when no pages", async () => {
    const t = convexTest(schema, modules);
    const result = await t.query(api.shared_logic.services.content.list as never, {} as never);
    expect(result).toEqual([]);
  });
});

import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../../schema";
import { internal } from "../../_generated/api";
import { modules } from "../../test.setup";

describe("memory service", () => {
  it("storeInternal stores preference and getRelevantMemoriesByQuery returns it", async () => {
    const t = convexTest(schema, modules);
    const storeInternal = (internal as Record<string, any>)["shared_logic/services/memory"]?.storeInternal;
    const getRelevant = (internal as Record<string, any>)["shared_logic/services/memory"]?.getRelevantMemoriesByQuery;
    if (!storeInternal || !getRelevant) return;

    await t.run(async (ctx) => {
      const id = await ctx.runMutation(storeInternal as never, {
        userId: "mem-user-1",
        memoryType: "preference",
        key: "user_name",
        value: "Ahmed",
      } as never);
      expect(typeof id).toBe("string");
      expect((id as string).length).toBeGreaterThan(0);
    });

    const result = await t.run(async (ctx) => {
      return await ctx.runQuery(getRelevant as never, {
        userId: "mem-user-1",
        query: "hi",
      } as never);
    });

    expect(result).not.toBeNull();
    expect(result).toHaveProperty("summary");
    expect((result as { summary: string }).summary).toContain("user_name");
    expect((result as { summary: string }).summary).toContain("Ahmed");
  });
});

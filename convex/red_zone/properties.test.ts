import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import schema from "../schema";
import { internalRefs } from "../shared_logic/lib/generatedApiRefs";
import { modules } from "../test.setup";

describe("red property primitives", () => {
  it("creates RED properties with derived search text and lists by RED id", async () => {
    const t = convexTest(schema, modules);
    const redId = await t.run((ctx) =>
      ctx.db.insert("RED", {
        name: "Developer One",
        slug: "developer-one",
      } as any),
    );

    const propertyId = await t.mutation(
      internalRefs["red_zone/properties"].create,
      {
        REDId: redId,
        title: "Tower",
        address: "Jeddah",
        description: "Sea view",
        price: 200,
        beds: 4,
        baths: 3,
      } as never,
    );

    const property = await t.query(internalRefs["red_zone/properties"].getById, {
      id: propertyId,
    } as never);
    expect((property as any)?.searchText).toContain("Sea view");
    expect((property as any)?.publicationState).toBe("draft");

    const page = await t.query(internalRefs["red_zone/properties"].listByRedId, {
      REDId: redId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never);
    expect((page as any).page).toHaveLength(1);
  });

  it("counts overview stats by RED id", async () => {
    const t = convexTest(schema, modules);
    const redId = await t.run((ctx) =>
      ctx.db.insert("RED", {
        name: "Developer One",
        slug: "developer-one",
      } as any),
    );

    await t.mutation(
      internalRefs["red_zone/properties"].create,
      {
        REDId: redId,
        title: "Tower",
        address: "Jeddah",
        description: "Sea view",
        price: 200,
        beds: 4,
        baths: 3,
      } as never,
    );

    const overview = await t.query(internalRefs["red_zone/overview"].countPropertiesByRedId, {
      REDId: redId,
    } as never);
    expect(overview).toEqual({ properties: 1 });
  });
});

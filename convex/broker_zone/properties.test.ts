import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

it("creates broker properties with derived search text and lists by broker id", async () => {
  const t = convexTest(schema, modules);
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
    } as any),
  );

  const propertyId = await t.mutation(
    api.broker_zone.properties.create,
    {
      brokerId,
      title: "Villa",
      address: "Riyadh",
      description: "Garden home",
      price: 100,
      beds: 3,
      baths: 2,
    } as never,
  );

  const property = await t.query(api.broker_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((property as any)?.searchText).toContain("Garden home");
  expect((property as any)?.publicationState).toBe("draft");

  const page = await t.query(api.broker_zone.properties.listByBrokerId, {
    brokerId,
    paginationOpts: { cursor: null, numItems: 10 },
  } as never);
  expect((page as any).page).toHaveLength(1);
});

it("publishes broker properties", async () => {
  const t = convexTest(schema, modules);
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
    } as any),
  );
  const propertyId = await t.mutation(
    api.broker_zone.properties.create,
    {
      brokerId,
      title: "Villa",
      address: "Riyadh",
      description: "Garden home",
      price: 100,
      beds: 3,
      baths: 2,
    } as never,
  );

  await t.mutation(api.broker_zone.properties.publish, {
    id: propertyId,
  } as never);

  const property = await t.query(api.broker_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((property as any)?.publicationState).toBe("published");
});

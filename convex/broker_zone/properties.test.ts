import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedBrokerProfile(
  t: ReturnType<typeof convexTest>,
  args: { authUserId: string; email: string; name: string; role: "broker" | "user"; brokerId?: string },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      brokerId: args.brokerId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

it("rejects anonymous broker property access", async () => {
  const t = convexTest(schema, modules);
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
      isVerified: true,
    } as any),
  );

  await expect(
    t.query(api.broker_zone.properties.listByBrokerId, {
      brokerId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Authentication required");
});

it("rejects wrong-role broker property access", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-user", email: "user@example.com", name: "User" });
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
    } as any),
  );

  await seedBrokerProfile(t, {
    authUserId: "auth-user",
    email: "user@example.com",
    name: "User",
    role: "user",
  });

  await expect(
    t.withIdentity(identity).query(api.broker_zone.properties.listByBrokerId, {
      brokerId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Insufficient role permissions");
});

it("blocks same-role callers from reading another broker property", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-broker-1", email: "broker1@example.com", name: "Broker One" });

  const { brokerOneId, brokerTwoId, foreignPropertyId } = await t.run(async (ctx) => {
    const [firstBrokerId, secondBrokerId] = await Promise.all([
      ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" } as any),
      ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two" } as any),
    ]);
    const propertyId = await ctx.db.insert("properties", {
      title: "Foreign Villa",
      address: "Riyadh",
      price: 100,
      beds: 3,
      baths: 2,
      description: "Foreign property",
      searchText: "Foreign Villa Riyadh Foreign property",
      publicationState: "draft",
      brokerId: secondBrokerId,
    } as any);
    return { brokerOneId: firstBrokerId, brokerTwoId: secondBrokerId, foreignPropertyId: propertyId };
  });

  await seedBrokerProfile(t, {
    authUserId: "auth-broker-1",
    email: "broker1@example.com",
    name: "Broker One",
    role: "broker",
    brokerId: brokerOneId,
  });

  await expect(
    t.withIdentity(identity).query(api.broker_zone.properties.getById, {
      id: foreignPropertyId,
    } as never),
  ).rejects.toThrow("Cannot access another broker property");

  await expect(
    t.withIdentity(identity).query(api.broker_zone.properties.listByBrokerId, {
      brokerId: brokerTwoId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Cannot access another broker organization");
});

it("lets the owner create, read, update, publish, and delete broker properties", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-broker-1", email: "broker1@example.com", name: "Broker One" });

  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
    } as any),
  );

  await seedBrokerProfile(t, {
    authUserId: "auth-broker-1",
    email: "broker1@example.com",
    name: "Broker One",
    role: "broker",
    brokerId,
  });

  const propertyId = await t.withIdentity(identity).mutation(
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

  const property = await t.withIdentity(identity).query(api.broker_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((property as any)?.searchText).toContain("Garden home");
  expect((property as any)?.publicationState).toBe("draft");

  const page = await t.withIdentity(identity).query(api.broker_zone.properties.listByBrokerId, {
    brokerId,
    paginationOpts: { cursor: null, numItems: 10 },
  } as never);
  expect((page as any).page).toHaveLength(1);

  await t.withIdentity(identity).mutation(api.broker_zone.properties.update, {
    id: propertyId,
    description: "Updated garden home",
  } as never);

  await t.run(async (ctx) => {
    const property = await ctx.db.get(propertyId);
    const dossier = property?.projectDossierId ? await ctx.db.get(property.projectDossierId) : null;
    await ctx.db.patch(propertyId, {
      ownerVerified: true,
      adLicenseStatus: "approved",
      listingVerified: true,
    } as any);
    await ctx.db.insert("projectBrokerAuthorizations", {
      dossierId: dossier?._id,
      propertyId,
      brokerId,
      channels: ["broker_network"],
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });

  await t.withIdentity(identity).mutation(api.broker_zone.properties.publish, {
    id: propertyId,
  } as never);

  const published = await t.withIdentity(identity).query(api.broker_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((published as any)?.publicationState).toBe("published");
  expect((published as any)?.searchText).toContain("Updated garden home");

  await t.withIdentity(identity).mutation(api.broker_zone.properties.remove, {
    id: propertyId,
  } as never);

  await expect(
    t.withIdentity(identity).query(api.broker_zone.properties.getById, {
      id: propertyId,
    } as never),
  ).rejects.toThrow("Property not found");
});

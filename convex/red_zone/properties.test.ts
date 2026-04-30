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

async function seedDeveloperProfile(
  t: ReturnType<typeof convexTest>,
  args: { authUserId: string; email: string; name: string; role: "developer" | "user"; REDId?: string },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      REDId: args.REDId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

it("rejects anonymous developer property access", async () => {
  const t = convexTest(schema, modules);
  const redId = await t.run((ctx) =>
    ctx.db.insert("RED", {
      name: "Developer One",
      slug: "developer-one",
      isVerified: true,
    } as any),
  );

  await expect(
    t.query(api.red_zone.properties.listByRedId, {
      REDId: redId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Authentication required");
});

it("rejects wrong-role developer property access", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-user", email: "user@example.com", name: "User" });
  const redId = await t.run((ctx) =>
    ctx.db.insert("RED", {
      name: "Developer One",
      slug: "developer-one",
    } as any),
  );

  await seedDeveloperProfile(t, {
    authUserId: "auth-user",
    email: "user@example.com",
    name: "User",
    role: "user",
  });

  await expect(
    t.withIdentity(identity).query(api.red_zone.properties.listByRedId, {
      REDId: redId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Insufficient role permissions");
});

it("blocks same-role callers from reading another developer property", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-dev-1", email: "dev1@example.com", name: "Developer One" });

  const { redOneId, redTwoId, foreignPropertyId } = await t.run(async (ctx) => {
    const [firstRedId, secondRedId] = await Promise.all([
      ctx.db.insert("RED", { name: "Developer One", slug: "developer-one" } as any),
      ctx.db.insert("RED", { name: "Developer Two", slug: "developer-two" } as any),
    ]);
    const propertyId = await ctx.db.insert("properties", {
      title: "Foreign Tower",
      address: "Jeddah",
      price: 200,
      beds: 4,
      baths: 3,
      description: "Foreign developer property",
      searchText: "Foreign Tower Jeddah Foreign developer property",
      publicationState: "draft",
      REDId: secondRedId,
    } as any);
    return { redOneId: firstRedId, redTwoId: secondRedId, foreignPropertyId: propertyId };
  });

  await seedDeveloperProfile(t, {
    authUserId: "auth-dev-1",
    email: "dev1@example.com",
    name: "Developer One",
    role: "developer",
    REDId: redOneId,
  });

  await expect(
    t.withIdentity(identity).query(api.red_zone.properties.getById, {
      id: foreignPropertyId,
    } as never),
  ).rejects.toThrow("Cannot access another developer property");

  await expect(
    t.withIdentity(identity).query(api.red_zone.properties.listByRedId, {
      REDId: redTwoId,
      paginationOpts: { cursor: null, numItems: 10 },
    } as never),
  ).rejects.toThrow("Cannot access another developer organization");
});

it("lets the owner create, read, update, publish, and delete developer properties", async () => {
  const t = convexTest(schema, modules);
  const identity = makeIdentity({ subject: "auth-dev-1", email: "dev1@example.com", name: "Developer One" });

  const redId = await t.run((ctx) =>
    ctx.db.insert("RED", {
      name: "Developer One",
      slug: "developer-one",
    } as any),
  );

  await seedDeveloperProfile(t, {
    authUserId: "auth-dev-1",
    email: "dev1@example.com",
    name: "Developer One",
    role: "developer",
    REDId: redId,
  });

  const propertyId = await t.withIdentity(identity).mutation(
    api.red_zone.properties.create,
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

  const property = await t.withIdentity(identity).query(api.red_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((property as any)?.searchText).toContain("Sea view");
  expect((property as any)?.publicationState).toBe("draft");

  const page = await t.withIdentity(identity).query(api.red_zone.properties.listByRedId, {
    REDId: redId,
    paginationOpts: { cursor: null, numItems: 10 },
  } as never);
  expect((page as any).page).toHaveLength(1);

  await t.withIdentity(identity).mutation(api.red_zone.properties.update, {
    id: propertyId,
    description: "Updated sea view",
  } as never);

  await t.run(async (ctx) => {
    await ctx.db.patch(propertyId, {
      ownerVerified: true,
      adLicenseStatus: "approved",
      listingVerified: true,
    } as any);
  });

  await t.withIdentity(identity).mutation(api.red_zone.properties.publish, {
    id: propertyId,
  } as never);

  const published = await t.withIdentity(identity).query(api.red_zone.properties.getById, {
    id: propertyId,
  } as never);
  expect((published as any)?.publicationState).toBe("published");
  expect((published as any)?.searchText).toContain("Updated sea view");

  await t.withIdentity(identity).mutation(api.red_zone.properties.remove, {
    id: propertyId,
  } as never);

  await expect(
    t.withIdentity(identity).query(api.red_zone.properties.getById, {
      id: propertyId,
    } as never),
  ).rejects.toThrow("Property not found");
});

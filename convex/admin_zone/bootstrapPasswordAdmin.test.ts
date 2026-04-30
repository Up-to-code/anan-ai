import { afterEach, beforeEach, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { modules } from "../test.setup";

const originalSecret = process.env.ADMIN_BOOTSTRAP_SECRET;

beforeEach(() => {
  process.env.ADMIN_BOOTSTRAP_SECRET = "test-bootstrap-secret";
});

afterEach(() => {
  if (originalSecret === undefined) {
    delete process.env.ADMIN_BOOTSTRAP_SECRET;
  } else {
    process.env.ADMIN_BOOTSTRAP_SECRET = originalSecret;
  }
});

it("creates an active approved admin profile by normalized email", async () => {
  const t = convexTest(schema, modules);

  const result = await t.mutation(
    api.admin_zone.bootstrapPasswordAdmin.ensureAdminPasswordProfile as never,
    {
      secret: "test-bootstrap-secret",
      email: "Admin@Example.COM ",
      name: "Ahmed Admin",
    } as never,
  );

  const profile = (await t.run((ctx) =>
    ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", "admin@example.com"))
      .first(),
  )) as Doc<"userProfiles"> | null;

  expect(result).toMatchObject({ created: true, email: "admin@example.com", role: "user", isAdmin: true });
  expect(profile).toMatchObject({
    email: "admin@example.com",
    name: "Ahmed Admin",
    role: "user",
    roleApprovalStatus: "approved",
    isActive: true,
    metadata: {
      platformAccess: {
        admin: {
          enabled: true,
          level: "owner",
          permissions: ["admin:*"],
        },
      },
    },
  });
});

it("is idempotent and upgrades an existing profile without duplicating rows", async () => {
  const t = convexTest(schema, modules);

  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: "old-auth",
      email: "admin@example.com",
      name: "Old Name",
      role: "user",
      roleApprovalStatus: "pending",
      isActive: false,
    } as never);
  });

  const result = await t.mutation(
    api.admin_zone.bootstrapPasswordAdmin.ensureAdminPasswordProfile as never,
    {
      secret: "test-bootstrap-secret",
      email: "admin@example.com",
      name: "New Name",
    } as never,
  );

  const profiles = (await t.run((ctx) => ctx.db.query("userProfiles").collect())) as Array<Doc<"userProfiles">>;

  expect(result).toMatchObject({ created: false, email: "admin@example.com", role: "user", isAdmin: true });
  expect(profiles).toHaveLength(1);
  expect(profiles[0]).toMatchObject({
    authUserId: "old-auth",
    name: "New Name",
    role: "user",
    roleApprovalStatus: "approved",
    isActive: true,
    metadata: {
      platformAccess: {
        admin: {
          enabled: true,
          level: "owner",
          permissions: ["admin:*"],
        },
      },
    },
  });
});

it("rejects missing or invalid bootstrap secrets", async () => {
  const t = convexTest(schema, modules);

  await expect(
    t.mutation(
      api.admin_zone.bootstrapPasswordAdmin.ensureAdminPasswordProfile as never,
      {
        secret: "wrong-secret",
        email: "admin@example.com",
      } as never,
    ),
  ).rejects.toThrow();
});

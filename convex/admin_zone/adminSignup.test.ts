import { afterEach, beforeEach, expect, it } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { modules } from "../test.setup";

const originalBootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET;
const originalPepper = process.env.ADMIN_SIGNUP_TOKEN_PEPPER;

beforeEach(() => {
  process.env.ADMIN_BOOTSTRAP_SECRET = "test-bootstrap-secret";
  process.env.ADMIN_SIGNUP_TOKEN_PEPPER = "test-token-pepper";
});

afterEach(() => {
  if (originalBootstrapSecret === undefined) delete process.env.ADMIN_BOOTSTRAP_SECRET;
  else process.env.ADMIN_BOOTSTRAP_SECRET = originalBootstrapSecret;
  if (originalPepper === undefined) delete process.env.ADMIN_SIGNUP_TOKEN_PEPPER;
  else process.env.ADMIN_SIGNUP_TOKEN_PEPPER = originalPepper;
});

it("completes bootstrap admin signup into profile metadata", async () => {
  const t = convexTest(schema, modules);

  await t.mutation(
    api.admin_zone.adminSignup.completeAdminSignup as never,
    {
      email: "Admin@Example.com",
      authUserId: "better-auth-user-1",
      name: "Admin User",
      bootstrapSecret: "test-bootstrap-secret",
    } as never,
  );

  const profile = (await t.run((ctx) =>
    ctx.db
      .query("userProfiles")
      .withIndex("email", (q) => q.eq("email", "admin@example.com"))
      .first(),
  )) as Doc<"userProfiles"> | null;

  expect(profile).toMatchObject({
    authUserId: "better-auth-user-1",
    role: "user",
    roleApprovalStatus: "approved",
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

it("rejects signup without invite token or bootstrap secret", async () => {
  const t = convexTest(schema, modules);

  await expect(
    t.mutation(
      api.admin_zone.adminSignup.validateAdminSignup as never,
      { email: "admin@example.com" } as never,
    ),
  ).rejects.toThrow();
});

it("creates and consumes a one-time invite", async () => {
  const t = convexTest(schema, modules);
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: "auth-admin",
      email: "owner@example.com",
      role: "user",
      metadata: {
        platformAccess: {
          admin: {
            enabled: true,
            level: "owner",
            permissions: ["admin:*"],
            grantedAt: Date.now(),
          },
        },
      },
      isActive: true,
    } as never);
  });

  const invite = await t.withIdentity({ subject: "auth-admin", email: "owner@example.com" } as any).mutation(
    api.admin_zone.adminSignup.createAdminSignupInvite as never,
    {
      email: "new-admin@example.com",
      level: "operator",
      permissions: ["admin:users"],
    } as never,
  ) as { token: string };

  await t.mutation(
    api.admin_zone.adminSignup.completeAdminSignup as never,
    {
      email: "new-admin@example.com",
      authUserId: "auth-new-admin",
      token: invite.token,
    } as never,
  );

  await expect(
    t.mutation(
      api.admin_zone.adminSignup.validateAdminSignup as never,
      { email: "new-admin@example.com", token: invite.token } as never,
    ),
  ).rejects.toThrow();
});

import { ConvexError } from "convex/values";
import { convexTest } from "convex-test";
import { expect, it } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

function makeIdentity(args: {
  subject: string;
  email: string;
  orgId?: string;
  orgSlug?: string;
  orgRole?: string;
}) {
  return {
    subject: args.subject,
    email: args.email,
    orgId: args.orgId,
    orgSlug: args.orgSlug,
    orgRole: args.orgRole,
  } as any;
}

async function seedProfileAndOrganization(t: ReturnType<typeof convexTest>) {
  await t.run(async (ctx) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: "Bridge Broker",
      slug: "bridge-broker",
    } as any);

    await ctx.db.insert("userProfiles", {
      authUserId: "auth-user-1",
      email: "owner@example.com",
      name: "Owner",
      role: "broker",
      brokerId,
      roleApprovalStatus: "approved",
      isActive: true,
      createdAt: 1,
      updatedAt: 1,
    } as any);

    await ctx.db.insert("organizationProfiles", {
      organizationId: "org-1",
      name: "Bridge Org",
      slug: "bridge-org",
      type: "broker",
      status: "active",
      isVerified: false,
      legacyOwnerType: "broker",
      legacyOwnerBrokerId: brokerId,
      legacyTenantOrgId: "tenant-org-1",
      createdByUserId: "auth-user-1",
      createdAt: 1,
      updatedAt: 1,
    } as any);
  });
}

it("loads an organization profile by explicit id without an active org claim", async () => {
  const t = convexTest(schema, modules);
  await seedProfileAndOrganization(t);

  const profile = await t.withIdentity(
    makeIdentity({ subject: "auth-user-1", email: "owner@example.com" }),
  ).query(
    api.shared_logic.organizationProfiles.getOrganizationProfileById as never,
    { organizationId: "org-1" } as never,
  ) as any;

  expect(profile?.organizationId).toBe("org-1");
  expect(profile?.legacyOwnerType).toBe("broker");
  expect(typeof profile?.legacyOwnerId).toBe("string");
});

it("still requires an active org claim for getCurrentOrganizationProfile", async () => {
  const t = convexTest(schema, modules);
  await seedProfileAndOrganization(t);

  await expect(
    t.withIdentity(
      makeIdentity({ subject: "auth-user-1", email: "owner@example.com" }),
    ).query(
      api.shared_logic.organizationProfiles.getCurrentOrganizationProfile as never,
      {} as never,
    ),
  ).rejects.toMatchObject({
    data: JSON.stringify({
      code: "FORBIDDEN",
      message: "Active organization required",
    }),
  } satisfies Partial<ConvexError<any>>);
});

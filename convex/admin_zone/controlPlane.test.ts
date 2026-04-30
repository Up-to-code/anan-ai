import { beforeEach, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

const mockRequireRole = vi.fn(async () => ({ authUserId: "admin-auth" }));

vi.mock("../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
  requireAdminAccess: mockRequireRole,
}));

beforeEach(() => {
  mockRequireRole.mockReset();
  mockRequireRole.mockResolvedValue({ authUserId: "admin-auth" });
});

async function seedLegacyProperties(t: ReturnType<typeof convexTest>) {
  const propertyIds: string[] = [];

  await t.run(async (ctx) => {
    const brokerId = await ctx.db.insert("brokers", {
      name: "Broker One",
      slug: "broker-one",
      isVerified: true,
      countryCode: "SA",
    } as any);

    await ctx.db.insert("tenantOrgLinks", {
      tenantOrgId: "tenant-1",
      ownerType: "broker",
      ownerBrokerId: brokerId,
      createdAt: 1,
      updatedAt: 1,
    } as any);

    for (let index = 0; index < 3; index += 1) {
      const propertyId = await ctx.db.insert("properties", {
        title: `Property ${index + 1}`,
        address: `Address ${index + 1}`,
        price: 100000 + index,
        beds: 2,
        baths: 2,
        description: `Legacy property ${index + 1}`,
        brokerId,
        publicationState: "published",
      } as any);
      propertyIds.push(String(propertyId));
    }
  });

  return propertyIds;
}

async function readBackfilledProperties(t: ReturnType<typeof convexTest>) {
  return t.run(async (ctx) => ctx.db.query("properties").order("asc").collect());
}

it("pages through legacy rows and eventually backfills rows beyond the first batch", async () => {
  const t = convexTest(schema, modules);
  await seedLegacyProperties(t);

  const first = await t.mutation(
    api.admin_zone.controlPlane.backfillScaleControlPlane as never,
    { limit: 1 } as never,
  ) as any;
  const afterFirst = await readBackfilledProperties(t);

  expect(first.patched).toBe(1);
  expect(first.isDone).toBe(false);
  expect(first.cursor).not.toBeNull();
  expect(afterFirst.filter((property) => property.tenantOrgId === "tenant-1")).toHaveLength(1);

  const second = await t.mutation(
    api.admin_zone.controlPlane.backfillScaleControlPlane as never,
    { limit: 1, cursor: first.cursor } as never,
  ) as any;
  const afterSecond = await readBackfilledProperties(t);

  expect(second.patched).toBe(1);
  expect(second.isDone).toBe(false);
  expect(second.cursor).not.toBeNull();
  expect(afterSecond.filter((property) => property.tenantOrgId === "tenant-1")).toHaveLength(2);

  let state = second;
  for (let attempt = 0; attempt < 8 && !state.isDone; attempt += 1) {
    state = await t.mutation(
      api.admin_zone.controlPlane.backfillScaleControlPlane as never,
      { limit: 1, cursor: state.cursor } as never,
    ) as any;
  }

  const afterAll = await readBackfilledProperties(t);

  expect(state.isDone).toBe(true);
  expect(state.cursor).toBeNull();
  expect(afterAll.filter((property) => property.tenantOrgId === "tenant-1")).toHaveLength(3);
  expect(afterAll.every((property) => property.createdAt != null && property.updatedAt != null)).toBe(true);
});

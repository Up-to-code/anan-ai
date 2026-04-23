import { beforeEach, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import { modules } from "../test.setup";

const mockCascadingDelete = {
  deleteWithCascadeBatched: vi.fn(async () => ({ deleted: 3 })),
};

const mockAuditLog = {
  logChange: vi.fn(async () => undefined),
};

const mockRequireRole = vi.fn(async () => ({ authUserId: "admin-auth" }));

vi.mock("../cascading", () => ({
  cascadingDelete: mockCascadingDelete,
}));

vi.mock("../auditLog", () => ({
  auditLog: mockAuditLog,
}));

vi.mock("../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
  requireAdminAccess: mockRequireRole,
}));

beforeEach(() => {
  mockCascadingDelete.deleteWithCascadeBatched.mockReset();
  mockAuditLog.logChange.mockReset();
  mockRequireRole.mockReset();
  mockCascadingDelete.deleteWithCascadeBatched.mockResolvedValue({ deleted: 3 });
  mockRequireRole.mockResolvedValue({ authUserId: "admin-auth" });
});

it("deletes broker orgs via cascade and logs audit event", async () => {
  const t = convexTest(schema, modules);
  let brokerId = "" as any;

  await t.run(async (ctx) => {
    brokerId = await ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" } as any);
  });

  const result = await t.mutation(
    api.admin_zone.organizations.deleteBrokerOrganization as never,
    { brokerId } as never,
  );

  expect(result).toEqual({ deleted: 3 });
  expect(mockCascadingDelete.deleteWithCascadeBatched).toHaveBeenCalledWith(
    expect.anything(),
    "brokers",
    brokerId,
    expect.objectContaining({ batchSize: 2000 }),
  );
  expect(mockAuditLog.logChange).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      action: "broker.deleted",
      resourceType: "brokers",
      resourceId: brokerId,
    }),
  );
});

it("deletes RED orgs via cascade and logs audit event", async () => {
  const t = convexTest(schema, modules);
  let redId = "" as any;

  await t.run(async (ctx) => {
    redId = await ctx.db.insert("RED", { name: "RED One", slug: "red-one" } as any);
  });

  const result = await t.mutation(
    api.admin_zone.organizations.deleteDeveloperOrganization as never,
    { redId } as never,
  );

  expect(result).toEqual({ deleted: 3 });
  expect(mockCascadingDelete.deleteWithCascadeBatched).toHaveBeenCalledWith(
    expect.anything(),
    "RED",
    redId,
    expect.objectContaining({ batchSize: 2000 }),
  );
  expect(mockAuditLog.logChange).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      action: "red.deleted",
      resourceType: "RED",
      resourceId: redId,
    }),
  );
});

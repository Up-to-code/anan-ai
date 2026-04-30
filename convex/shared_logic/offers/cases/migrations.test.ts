import { convexTest } from "convex-test";
import { beforeEach, expect, it, vi } from "vitest";
import schema from "../../../schema";
import { api } from "../../../_generated/api";
import { modules } from "../../../test.setup";

const mockRequireAdminAccess = vi.fn();

vi.mock("../../../_core/security/accessPolicy", () => ({
  requireAdminAccess: mockRequireAdminAccess,
}));

beforeEach(() => {
  mockRequireAdminAccess.mockReset();
  mockRequireAdminAccess.mockResolvedValue({ authUserId: "admin-1" });
});

it("dry-runs the execution provider role migration without touching already migrated rows", async () => {
  const t = convexTest(schema, modules);
  const offerCaseId = await t.run(async (ctx) => {
    const offerPackageId = await ctx.db.insert("offerPackages", {
      ownerAuthUserId: "owner-1",
      askingPrice: 1,
      visibility: "private",
      allowedAudience: "both",
      createdAt: 1,
      updatedAt: 1,
    } as any);
    return ctx.db.insert("offerCases", {
      offerPackageId,
      type: "open_offer",
      stage: "targeted",
      visibility: "private",
      initiatedByAuthUserId: "owner-1",
      status: "open",
      createdAt: 1,
      updatedAt: 1,
      lastActivityAt: 1,
    } as any);
  });
  await t.run((ctx) =>
    ctx.db.insert("offerCaseParticipants", {
      offerCaseId,
      role: "execution_provider",
      status: "pending",
      createdAt: 1,
      updatedAt: 1,
    } as any),
  );

  const result = await t.mutation(api.shared_logic.offers.cases.migrations.backfillExecutionProviderRole, {
    dryRun: true,
  });

  expect(mockRequireAdminAccess).toHaveBeenCalled();
  expect(result).toEqual({ total: 1, updated: 0, dryRun: true });
});

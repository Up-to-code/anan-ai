import { beforeEach, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
import type { Doc } from "../_generated/dataModel";
import { modules } from "../test.setup";

const mockRequireRole = vi.fn(async () => ({ authUserId: "admin-auth" }));

vi.mock("../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
}));

beforeEach(() => {
  mockRequireRole.mockReset();
  mockRequireRole.mockResolvedValue({ authUserId: "admin-auth" });
});

it("approves organization verification and marks the broker as verified", async () => {
  const t = convexTest(schema, modules);
  let brokerId = "" as any;
  let profileId = "" as any;
  let requestId = "" as any;

  await t.run(async (ctx) => {
    brokerId = await ctx.db.insert("brokers", {
      name: "Broker Approval",
      slug: "broker-approval",
      isVerified: false,
      status: "pending",
    } as any);
    profileId = await ctx.db.insert("userProfiles", {
      authUserId: "auth-1",
      brokerId,
      name: "Broker Admin",
      email: "broker@example.com",
    } as any);
    requestId = await ctx.db.insert("verificationRequests", {
      requestType: "broker",
      subjectProfileId: profileId,
      subjectBrokerId: brokerId,
      authUserId: "auth-1",
      title: "طلب توثيق جهة",
      currentStatus: "new",
      submittedData: {},
      attachedDocuments: [],
      submittedAt: Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });

  await t.mutation(
    api.admin_zone.verifications.reviewVerificationRequest as never,
    { id: requestId, status: "approved", reviewerId: "admin-auth" } as never,
  );

  const broker = (await t.run((ctx) => ctx.db.get(brokerId))) as Doc<"brokers"> | null;
  const request = (await t.run((ctx) => ctx.db.get(requestId))) as Doc<"verificationRequests"> | null;

  expect(broker?.isVerified).toBe(true);
  expect(broker?.status).toBe("active");
  expect(request?.currentStatus).toBe("approved");
});

it("closes organization verification and clears verified access", async () => {
  const t = convexTest(schema, modules);
  let brokerId = "" as any;
  let profileId = "" as any;
  let requestId = "" as any;

  await t.run(async (ctx) => {
    brokerId = await ctx.db.insert("brokers", {
      name: "Broker Closed",
      slug: "broker-closed",
      isVerified: true,
      status: "active",
    } as any);
    profileId = await ctx.db.insert("userProfiles", {
      authUserId: "auth-2",
      brokerId,
      name: "Broker Closed User",
      email: "closed@example.com",
    } as any);
    requestId = await ctx.db.insert("verificationRequests", {
      requestType: "broker",
      subjectProfileId: profileId,
      subjectBrokerId: brokerId,
      authUserId: "auth-2",
      title: "طلب توثيق جهة",
      currentStatus: "approved",
      submittedData: {},
      attachedDocuments: [],
      submittedAt: Date.now() - 5000,
      reviewedAt: Date.now() - 4000,
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 4000,
    } as any);
  });

  await t.mutation(
    api.admin_zone.verifications.reviewVerificationRequest as never,
    {
      id: requestId,
      status: "closed",
      reviewerId: "admin-auth",
      reviewerNotes: "تم إغلاق التوثيق لإعادة التقديم.",
    } as never,
  );

  const broker = (await t.run((ctx) => ctx.db.get(brokerId))) as Doc<"brokers"> | null;
  const request = (await t.run((ctx) => ctx.db.get(requestId))) as Doc<"verificationRequests"> | null;

  expect(broker?.isVerified).toBe(false);
  expect(request?.currentStatus).toBe("closed");
  expect(request?.reviewerNotes).toBe("تم إغلاق التوثيق لإعادة التقديم.");
});

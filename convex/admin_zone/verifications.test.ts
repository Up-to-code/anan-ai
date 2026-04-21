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

it("approves property verification and syncs the property ad-license status", async () => {
  const t = convexTest(schema, modules);
  let propertyId = "" as any;
  let requestId = "" as any;

  await t.run(async (ctx) => {
    propertyId = await ctx.db.insert("properties", {
      title: "Property Approval",
      address: "Riyadh",
      description: "Property approval target",
      price: 100,
      beds: 3,
      baths: 2,
      adLicenseStatus: "pending",
      publicationState: "draft",
      searchText: "Property Approval Riyadh Property approval target",
    } as any);
    requestId = await ctx.db.insert("verificationRequests", {
      requestType: "property",
      subjectPropertyId: propertyId,
      authUserId: "auth-prop",
      title: "طلب توثيق إعلان عقاري",
      currentStatus: "new",
      submittedData: { adLicenseNumber: "AD-123" },
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

  const property = (await t.run((ctx) => ctx.db.get(propertyId))) as Doc<"properties"> | null;
  const request = (await t.run((ctx) => ctx.db.get(requestId))) as Doc<"verificationRequests"> | null;

  expect(property?.adLicenseStatus).toBe("approved");
  expect(property?.adLicenseNumber).toBe("AD-123");
  expect(property?.adLicenseVerificationRequestId).toBe(requestId);
  expect(request?.currentStatus).toBe("approved");
});

it("returns verification detail with subject metadata and decision history", async () => {
  const t = convexTest(schema, modules);
  let brokerId = "" as any;
  let profileId = "" as any;
  let requestId = "" as any;

  await t.run(async (ctx) => {
    brokerId = await ctx.db.insert("brokers", {
      name: "Broker Detail",
      slug: "broker-detail",
      isVerified: false,
      status: "pending",
    } as any);
    profileId = await ctx.db.insert("userProfiles", {
      authUserId: "auth-detail",
      brokerId,
      name: "Broker Detail User",
      email: "detail@example.com",
      role: "broker",
      roleApprovalStatus: "pending",
    } as any);
    requestId = await ctx.db.insert("verificationRequests", {
      requestType: "broker",
      subjectProfileId: profileId,
      subjectBrokerId: brokerId,
      authUserId: "auth-detail",
      title: "طلب توثيق جهة",
      currentStatus: "approved",
      submittedData: {},
      attachedDocuments: [{ key: "doc-1", url: "https://files.test/doc.pdf", name: "doc.pdf" }],
      submittedAt: Date.now() - 5000,
      reviewedAt: Date.now() - 1000,
      reviewerNotes: "Approved",
      createdAt: Date.now() - 5000,
      updatedAt: Date.now() - 1000,
    } as any);
  });

  const detail = await t.query(
    api.admin_zone.verifications.getVerificationRequest as never,
    { id: requestId } as never,
  );

  expect((detail as any)?.subject?.profile?.email).toBe("detail@example.com");
  expect((detail as any)?.subject?.broker?.name).toBe("Broker Detail");
  expect((detail as any)?.documentsCount).toBe(1);
  expect((detail as any)?.decisionHistory).toHaveLength(2);
});

it("approves a requested developer role and clears the stale requested role", async () => {
  const t = convexTest(schema, modules);
  let redId = "" as any;
  let profileId = "" as any;
  let requestId = "" as any;

  await t.run(async (ctx) => {
    redId = await ctx.db.insert("RED", {
      name: "Developer Approval",
      slug: "developer-approval",
      isVerified: false,
      status: "pending",
    } as any);
    profileId = await ctx.db.insert("userProfiles", {
      authUserId: "auth-dev",
      name: "Developer User",
      email: "developer@example.com",
      role: "user",
      requestedRole: "developer",
      roleApprovalStatus: "pending",
      developerId: redId,
    } as any);
    requestId = await ctx.db.insert("verificationRequests", {
      requestType: "user",
      subjectProfileId: profileId,
      authUserId: "auth-dev",
      title: "طلب ترقية مطور",
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

  const profile = (await t.run((ctx) => ctx.db.get(profileId))) as Doc<"userProfiles"> | null;

  expect(profile?.role).toBe("developer");
  expect((profile as any)?.developerId).toBe(redId);
  expect((profile as any)?.requestedRole).toBeUndefined();
  expect((profile as any)?.roleApprovalStatus).toBe("approved");
});

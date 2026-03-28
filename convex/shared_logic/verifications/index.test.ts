import { expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

const mockRequireOrganizationMembership = vi.fn();
const mockRequireManagerAccess = vi.fn();

vi.mock("../agencies/repositories/membership", () => ({
  requireOrganizationMembership: mockRequireOrganizationMembership,
  requireManagerAccess: mockRequireManagerAccess,
}));

function setBrokerMembership(profileId: unknown, brokerId: unknown, role: "manager" | "member" = "manager") {
  mockRequireOrganizationMembership.mockReset();
  mockRequireManagerAccess.mockReset();
  const membership = {
    owner: {
      ownerType: "broker",
      ownerBrokerId: brokerId,
      tenantOrgId: "tenant-1",
    },
    profile: {
      _id: profileId,
      authUserId: "auth-1",
    },
    membership: {
      role,
      status: "active",
    },
  };
  mockRequireOrganizationMembership.mockResolvedValue(membership);
  if (role === "manager") {
    mockRequireManagerAccess.mockResolvedValue(membership);
    return;
  }
  mockRequireManagerAccess.mockRejectedValue(
    new ConvexError({ code: "FORBIDDEN", message: "Manager role required" }),
  );
}

function buildSampleVerificationPayload() {
  return {
    documents: [
      {
        key: "doc-1",
        url: "https://files.test/doc.pdf",
        name: "doc.pdf",
        size: 1000,
        mime: "application/pdf",
      },
    ],
    requirements: ["broker-fal-license"],
  } as const;
}

it("creates a verification request for the current broker org", async () => {
  const t = convexTest(schema, modules);
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" }),
  );
  const profileId = await t.run((ctx) =>
    ctx.db.insert("userProfiles", { authUserId: "auth-1", brokerId }),
  );

  setBrokerMembership(profileId, brokerId);

  await t.mutation(
    api.shared_logic.verifications.index.createVerificationRequestForCurrentOrg as never,
    buildSampleVerificationPayload() as never,
  );

  const requests = await t.run((ctx) => ctx.db.query("verificationRequests").collect());
  expect(requests).toHaveLength(1);
  expect(requests[0].requestType).toBe("broker");
  expect(requests[0].attachedDocuments).toHaveLength(1);
});

it("rejects submissions without documents", async () => {
  const t = convexTest(schema, modules);
  const redId = await t.run((ctx) =>
    ctx.db.insert("RED", { name: "Developer One", slug: "developer-one" }),
  );
  mockRequireManagerAccess.mockReset();
  mockRequireManagerAccess.mockResolvedValue({
    owner: {
      ownerType: "RED",
      ownerREDId: redId,
      tenantOrgId: "tenant-1",
    },
    profile: {
      _id: "profile-2",
      authUserId: "auth-2",
    },
    membership: {
      role: "manager",
      status: "active",
    },
  });

  await expect(
    t.mutation(
      api.shared_logic.verifications.index.createVerificationRequestForCurrentOrg as never,
      {
        documents: [],
      } as never,
    ),
  ).rejects.toBeInstanceOf(ConvexError);
});

it("rejects organization verification submissions from non-managers", async () => {
  const t = convexTest(schema, modules);
  const brokerId = await t.run((ctx) =>
    ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two" }),
  );
  const profileId = await t.run((ctx) =>
    ctx.db.insert("userProfiles", { authUserId: "auth-2", brokerId }),
  );

  setBrokerMembership(profileId, brokerId, "member");

  await expect(
    t.mutation(
      api.shared_logic.verifications.index.createVerificationRequestForCurrentOrg as never,
      buildSampleVerificationPayload() as never,
    ),
  ).rejects.toBeInstanceOf(ConvexError);
});

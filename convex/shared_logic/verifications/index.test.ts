import { describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import { ConvexError } from "convex/values";
import schema from "../../schema";
import { apiRefs } from "../lib/generatedApiRefs";
import { modules } from "../../test.setup";

const mockRequireOrganizationMembership = vi.fn();

vi.mock("../agencies/repositories/membership", () => ({
  requireOrganizationMembership: mockRequireOrganizationMembership,
}));

describe("verification requests", () => {
  it("creates a verification request for the current broker org", async () => {
    const t = convexTest(schema, modules);
    const brokerId = await t.run((ctx) =>
      ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" }),
    );
    const profileId = await t.run((ctx) =>
      ctx.db.insert("userProfiles", { authUserId: "auth-1", brokerId }),
    );

    mockRequireOrganizationMembership.mockReset();
    mockRequireOrganizationMembership.mockResolvedValue({
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
        role: "manager",
        status: "active",
      },
    });

    await t.mutation(
      apiRefs["shared_logic/verifications/index"].createVerificationRequestForCurrentOrg as never,
      {
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
      } as never,
    );

    const requests = await t.run((ctx) => ctx.db.query("verificationRequests").collect());
    expect(requests).toHaveLength(1);
    expect(requests[0].requestType).toBe("broker");
    expect(requests[0].attachedDocuments).toHaveLength(1);
  });

  it("rejects submissions without documents", async () => {
    const t = convexTest(schema, modules);
    mockRequireOrganizationMembership.mockReset();
    mockRequireOrganizationMembership.mockResolvedValue({
      owner: {
        ownerType: "RED",
        ownerREDId: "red-1",
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
        apiRefs["shared_logic/verifications/index"].createVerificationRequestForCurrentOrg as never,
        {
          documents: [],
        } as never,
      ),
    ).rejects.toBeInstanceOf(ConvexError);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { apiRefs } from "../shared_logic/lib/generatedApiRefs";
import { modules } from "../test.setup";

const mockTenants = {
  createOrganization: vi.fn(async () => "tenant-org"),
  getMember: vi.fn(async () => null),
  addMember: vi.fn(async () => undefined),
  updateMemberRole: vi.fn(async () => undefined),
  suspendMember: vi.fn(async () => undefined),
  listInvitations: vi.fn(async () => []),
  inviteMember: vi.fn(async () => ({ invitationId: "invite-1" })),
};

const mockRequireRole = vi.fn(async () => ({ authUserId: "admin-auth" }));

vi.mock("../tenants", () => ({
  tenants: mockTenants,
}));

vi.mock("../_core/security/accessPolicy", () => ({
  requireRole: mockRequireRole,
}));

function stubRandomUUID() {
  const original = globalThis.crypto?.randomUUID;
  if (!globalThis.crypto) {
    // @ts-expect-error - test shim
    globalThis.crypto = {};
  }
  // @ts-expect-error - test shim
  globalThis.crypto.randomUUID = () => "test-uuid";
  return () => {
    if (original) {
      // @ts-expect-error - test shim
      globalThis.crypto.randomUUID = original;
    }
  };
}

describe("tenants migration", () => {
  beforeEach(() => {
    mockTenants.createOrganization.mockReset();
    mockTenants.getMember.mockReset();
    mockTenants.addMember.mockReset();
    mockTenants.updateMemberRole.mockReset();
    mockTenants.suspendMember.mockReset();
    mockTenants.listInvitations.mockReset();
    mockTenants.inviteMember.mockReset();
    mockRequireRole.mockReset();
    mockTenants.createOrganization.mockResolvedValue("tenant-org");
    mockTenants.getMember.mockResolvedValue(null);
    mockTenants.addMember.mockResolvedValue(undefined);
    mockTenants.updateMemberRole.mockResolvedValue(undefined);
    mockTenants.suspendMember.mockResolvedValue(undefined);
    mockTenants.listInvitations.mockResolvedValue([]);
    mockTenants.inviteMember.mockResolvedValue({ invitationId: "invite-1" });
    mockRequireRole.mockResolvedValue({ authUserId: "admin-auth" });
  });

  it("dry run skips writes but reports counts", async () => {
    const restoreUUID = stubRandomUUID();
    const t = convexTest(schema, modules);

    let brokerId = "" as any;
    let redId = "" as any;
    let brokerNoActorId = "" as any;
    let memberProfileId = "" as any;

    await t.run(async (ctx) => {
      brokerId = await ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" } as any);
      brokerNoActorId = await ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two" } as any);
      redId = await ctx.db.insert("RED", { name: "RED One", slug: "red-one" } as any);

      await ctx.db.insert("userProfiles", {
        authUserId: "auth-broker-owner",
        email: "broker@owner.com",
        name: "Broker Owner",
        brokerId,
        role: "broker",
        roleStatus: "approved",
        isActive: true,
      } as any);

      await ctx.db.insert("userProfiles", {
        authUserId: "auth-red-owner",
        email: "red@owner.com",
        name: "RED Owner",
        REDId: redId,
        role: "RED",
        roleStatus: "approved",
        isActive: true,
      } as any);

      memberProfileId = await ctx.db.insert("userProfiles", {
        authUserId: "auth-member",
        email: "member@example.com",
        name: "Member",
        role: "broker",
        roleStatus: "approved",
        isActive: true,
      } as any);

      await ctx.db.insert("organizationMemberships", {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        authUserId: "auth-member",
        profileId: memberProfileId,
        role: "manager",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      await ctx.db.insert("teamInvites", {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        email: "invite@example.com",
        role: "member",
        token: "token-1",
        status: "pending",
        invitedBy: "auth-broker-owner",
        expiresAt: Date.now() + 1000 * 60 * 60,
      } as any);
    });

    const result = await t.mutation(
      apiRefs["admin_zone/tenantsMigration"].migrateTenantsFromLegacy as never,
      { dryRun: true } as never,
    );

    const tenantOrgLinks = await t.run(async (ctx) => ctx.db.query("tenantOrgLinks").collect());
    const profiles = await t.run(async (ctx) => ctx.db.query("userProfiles").collect());

    expect(result.dryRun).toBe(true);
    expect(result.createdTenantOrgs).toBe(2);
    expect(result.skippedTenantOrgs).toBe(1);
    expect(tenantOrgLinks).toHaveLength(0);
    expect(profiles.every((profile) => !profile.currentTenantOrgId)).toBe(true);

    restoreUUID();
  });

  it("writes tenant org links, memberships, invites, and profile backfills", async () => {
    const t = convexTest(schema, modules);

    mockTenants.createOrganization
      .mockResolvedValueOnce("tenant-broker")
      .mockResolvedValueOnce("tenant-red");

    let brokerId = "" as any;
    let redId = "" as any;
    let memberProfileId = "" as any;

    await t.run(async (ctx) => {
      brokerId = await ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" } as any);
      redId = await ctx.db.insert("RED", { name: "RED One", slug: "red-one" } as any);

      await ctx.db.insert("userProfiles", {
        authUserId: "auth-broker-owner",
        email: "broker@owner.com",
        name: "Broker Owner",
        brokerId,
        role: "broker",
        roleStatus: "approved",
        isActive: true,
      } as any);

      await ctx.db.insert("userProfiles", {
        authUserId: "auth-red-owner",
        email: "red@owner.com",
        name: "RED Owner",
        REDId: redId,
        role: "RED",
        roleStatus: "approved",
        isActive: true,
      } as any);

      memberProfileId = await ctx.db.insert("userProfiles", {
        authUserId: "auth-member",
        email: "member@example.com",
        name: "Member",
        role: "broker",
        roleStatus: "approved",
        isActive: true,
      } as any);

      await ctx.db.insert("organizationMemberships", {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        authUserId: "auth-member",
        profileId: memberProfileId,
        role: "manager",
        status: "active",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);

      await ctx.db.insert("teamInvites", {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        email: "invite@example.com",
        role: "member",
        token: "token-1",
        status: "pending",
        invitedBy: "auth-broker-owner",
        expiresAt: Date.now() + 1000 * 60 * 60,
      } as any);
    });

    const result = await t.mutation(
      apiRefs["admin_zone/tenantsMigration"].migrateTenantsFromLegacy as never,
      {} as never,
    );

    const tenantOrgLinks = await t.run(async (ctx) => ctx.db.query("tenantOrgLinks").collect());
    const profiles = await t.run(async (ctx) => ctx.db.query("userProfiles").collect());

    expect(result.createdTenantOrgs).toBe(2);
    expect(tenantOrgLinks).toHaveLength(2);
    expect(tenantOrgLinks.map((link) => link.tenantOrgId).sort()).toEqual(["tenant-broker", "tenant-red"]);
    expect(profiles.some((profile) => profile.currentTenantOrgId === "tenant-broker")).toBe(true);
    expect(mockTenants.addMember).toHaveBeenCalledWith(
      expect.anything(),
      "auth-broker-owner",
      "tenant-broker",
      "auth-member",
      "manager",
    );
    expect(mockTenants.inviteMember).toHaveBeenCalledWith(
      expect.anything(),
      "auth-broker-owner",
      "tenant-broker",
      "invite@example.com",
      "member",
      expect.any(Object),
    );
  });
});

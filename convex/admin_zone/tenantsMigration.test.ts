import { beforeEach, describe, expect, it, vi } from "vitest";
import { convexTest } from "convex-test";
import schema from "../schema";
import { api } from "../_generated/api";
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

vi.mock("../tenants", () => ({ tenants: mockTenants }));
vi.mock("../_core/security/accessPolicy", () => ({ requireRole: mockRequireRole }));

function stubRandomUUID() {
  const original = globalThis.crypto?.randomUUID;
  if (!globalThis.crypto) {
    // @ts-ignore - test shim
    globalThis.crypto = {};
  }
  // @ts-ignore - test shim
  globalThis.crypto.randomUUID = () => "test-uuid";
  return () => {
    if (original) {
      // @ts-ignore - test shim
      globalThis.crypto.randomUUID = original;
    }
  };
}

function resetMocks() {
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
}

async function insertOwnerProfiles(ctx: any, brokerId: any, redId: any) {
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
}

async function insertMemberProfile(ctx: any) {
  return ctx.db.insert("userProfiles", {
    authUserId: "auth-member",
    email: "member@example.com",
    name: "Member",
    role: "broker",
    roleStatus: "approved",
    isActive: true,
  } as any);
}

async function insertLegacyMembershipAndInvite(ctx: any, brokerId: any, memberProfileId: any) {
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
}

async function seedLegacyData(t: ReturnType<typeof convexTest>, includeBrokerWithoutActor = false) {
  const ids = { brokerId: "" as any, redId: "" as any, brokerNoActorId: "" as any, memberProfileId: "" as any };
  await t.run(async (ctx) => {
    ids.brokerId = await ctx.db.insert("brokers", { name: "Broker One", slug: "broker-one" } as any);
    if (includeBrokerWithoutActor) {
      ids.brokerNoActorId = await ctx.db.insert("brokers", { name: "Broker Two", slug: "broker-two" } as any);
    }
    ids.redId = await ctx.db.insert("RED", { name: "RED One", slug: "red-one" } as any);
    await insertOwnerProfiles(ctx, ids.brokerId, ids.redId);
    ids.memberProfileId = await insertMemberProfile(ctx);
    await insertLegacyMembershipAndInvite(ctx, ids.brokerId, ids.memberProfileId);
  });
  return ids;
}

async function readMigrationState(t: ReturnType<typeof convexTest>) {
  const tenantOrgLinks = await t.run(async (ctx) => ctx.db.query("tenantOrgLinks").collect());
  const profiles = await t.run(async (ctx) => ctx.db.query("userProfiles").collect());
  return { tenantOrgLinks, profiles };
}

function registerDryRunTest() {
  it("dry run skips writes but reports counts", async () => {
    const restoreUUID = stubRandomUUID();
    const t = convexTest(schema, modules);
    await seedLegacyData(t, true);

    const result = (await t.mutation(api.admin_zone.tenantsMigration.migrateTenantsFromLegacy as never, { dryRun: true } as never)) as any;
    const { tenantOrgLinks, profiles } = await readMigrationState(t);

    expect(result.dryRun).toBe(true);
    expect(result.createdTenantOrgs).toBe(2);
    expect(result.skippedTenantOrgs).toBe(1);
    expect(tenantOrgLinks).toHaveLength(0);
    expect(profiles.every((profile) => profile.currentTenantOrgId == null)).toBe(true);

    restoreUUID();
  });
}

function registerWriteMigrationTest() {
  it("writes tenant org links, memberships, invites, and profile backfills", async () => {
    const t = convexTest(schema, modules);
    mockTenants.createOrganization.mockResolvedValueOnce("tenant-broker").mockResolvedValueOnce("tenant-red");

    await seedLegacyData(t);
    const result = (await t.mutation(api.admin_zone.tenantsMigration.migrateTenantsFromLegacy as never, {} as never)) as any;
    const { tenantOrgLinks, profiles } = await readMigrationState(t);

    expect(result.createdTenantOrgs).toBe(2);
    expect(tenantOrgLinks).toHaveLength(2);
    expect(tenantOrgLinks.map((link) => link.tenantOrgId).sort()).toEqual(["tenant-broker", "tenant-red"]);
    expect(profiles.some((profile) => profile.currentTenantOrgId === "tenant-broker")).toBe(true);
    expect(mockTenants.addMember).toHaveBeenCalledWith(expect.anything(), "auth-broker-owner", "tenant-broker", "auth-member", "manager");
    expect(mockTenants.inviteMember).toHaveBeenCalledWith(expect.anything(), "auth-broker-owner", "tenant-broker", "invite@example.com", "member", expect.any(Object));
  });
}

function registerTenantMigrationTests() {
  beforeEach(resetMocks);
  registerDryRunTest();
  registerWriteMigrationTest();
}

describe("tenants migration", registerTenantMigrationTests);

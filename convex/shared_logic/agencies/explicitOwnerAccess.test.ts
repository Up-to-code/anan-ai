import { convexTest } from "convex-test";
import { beforeEach, describe, expect, it, vi } from "vitest";
import schema from "../../schema";
import { api } from "../../_generated/api";
import { modules } from "../../test.setup";

vi.mock("../../_core/security/authIdentity", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../_core/security/authIdentity")>();
  return {
    ...actual,
    getAuthUserId: vi.fn(async (_ctx: unknown) => null),
    getAuthSessionId: vi.fn(async (_ctx: unknown) => null),
  };
});

const tenantsMock = vi.hoisted(() => ({
  getMember: vi.fn(),
  listMembers: vi.fn(),
  listInvitations: vi.fn(),
  inviteMember: vi.fn(),
  getInvitation: vi.fn(),
  cancelInvitation: vi.fn(),
}));

vi.mock("../../tenants", () => ({
  tenants: tenantsMock,
}));
vi.mock("../../auditLog", () => ({
  auditLog: {
    log: vi.fn(async () => undefined),
    logChange: vi.fn(async () => undefined),
  },
}));

function makeIdentity(args: { subject: string; email: string; name: string }) {
  return {
    subject: args.subject,
    email: args.email,
    name: args.name,
  } as any;
}

async function seedProfile(
  t: ReturnType<typeof convexTest>,
  args: {
    authUserId: string;
    email: string;
    name: string;
    role: "broker" | "user";
    isAdmin?: boolean;
    brokerId?: string;
    currentTenantOrgId?: string;
  },
) {
  await t.run(async (ctx) => {
    await ctx.db.insert("userProfiles", {
      authUserId: args.authUserId,
      email: args.email,
      name: args.name,
      username: args.name.toLowerCase().replace(/\s+/g, "-"),
      usernameLower: args.name.toLowerCase().replace(/\s+/g, "-"),
      role: args.role,
      metadata: args.isAdmin
        ? {
            platformAccess: {
              admin: {
                enabled: true,
                level: "owner",
                permissions: ["admin:*"],
                grantedAt: Date.now(),
              },
            },
          }
        : undefined,
      brokerId: args.brokerId,
      currentTenantOrgId: args.currentTenantOrgId,
      isActive: true,
      roleStatus: "approved",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    } as any);
  });
}

beforeEach(() => {
  tenantsMock.getMember.mockReset();
  tenantsMock.listMembers.mockReset();
  tenantsMock.listInvitations.mockReset();
  tenantsMock.inviteMember.mockReset();
  tenantsMock.getInvitation.mockReset();
  tenantsMock.cancelInvitation.mockReset();
});

describe("explicit owner organization endpoints", () => {
  it("allows same-tenant members to read explicit-owner team lists", async () => {
    const t = convexTest(schema, modules);
    const memberIdentity = makeIdentity({
      subject: "auth-member",
      email: "member@example.com",
      name: "Member",
    });

    const brokerId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("brokers", { name: "Broker Org", slug: "broker-org" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-a",
        ownerType: "broker",
        ownerBrokerId: id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      const otherBrokerId = await ctx.db.insert("brokers", { name: "Other Broker", slug: "other-broker" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-b",
        ownerType: "broker",
        ownerBrokerId: otherBrokerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      return id;
    });

    await seedProfile(t, {
      authUserId: "auth-member",
      email: "member@example.com",
      name: "Member",
      role: "user",
      currentTenantOrgId: "tenant-a",
    });
    await seedProfile(t, {
      authUserId: "auth-owner",
      email: "owner@example.com",
      name: "Owner",
      role: "broker",
      brokerId,
      currentTenantOrgId: "tenant-a",
    });

    tenantsMock.getMember.mockImplementation(async (_ctx: unknown, tenantOrgId: string, authUserId: string) => {
      if (tenantOrgId === "tenant-a" && authUserId === "auth-member") {
        return { userId: "auth-member", role: "member", status: "active", joinedAt: 1 };
      }
      return null;
    });
    tenantsMock.listMembers.mockResolvedValue([
      { userId: "auth-owner", role: "owner", status: "active", joinedAt: 1 },
    ]);

    const members = await t.withIdentity(memberIdentity).query(
      api.shared_logic.agencies.repositories.listTeamMembersByOwner as never,
      { ownerType: "broker", ownerBrokerId: brokerId } as never,
    );

    expect((members as any[])[0]).toEqual(
      expect.objectContaining({ authUserId: "auth-owner", role: "manager" }),
    );
  });

  it("blocks cross-tenant access to explicit-owner team lists", async () => {
    const t = convexTest(schema, modules);
    const memberIdentity = makeIdentity({
      subject: "auth-member-b",
      email: "member-b@example.com",
      name: "Member B",
    });

    const brokerId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("brokers", { name: "Broker Org", slug: "broker-org" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-a",
        ownerType: "broker",
        ownerBrokerId: id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      const otherBrokerId = await ctx.db.insert("brokers", { name: "Other Broker", slug: "other-broker" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-b",
        ownerType: "broker",
        ownerBrokerId: otherBrokerId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      return id;
    });

    await seedProfile(t, {
      authUserId: "auth-member-b",
      email: "member-b@example.com",
      name: "Member B",
      role: "user",
      currentTenantOrgId: "tenant-b",
    });

    tenantsMock.getMember.mockImplementation(async (_ctx: unknown, tenantOrgId: string, authUserId: string) => {
      if (tenantOrgId === "tenant-b" && authUserId === "auth-member-b") {
        return { userId: "auth-member-b", role: "member", status: "active", joinedAt: 1 };
      }
      return null;
    });

    await expect(
      t.withIdentity(memberIdentity).query(
        api.shared_logic.agencies.repositories.listTeamMembersByOwner as never,
        { ownerType: "broker", ownerBrokerId: brokerId } as never,
      ),
    ).rejects.toThrow("Cross-organization access is not allowed");
  });

  it("allows same-tenant managers to create and cancel explicit-owner invites", async () => {
    const t = convexTest(schema, modules);
    const managerIdentity = makeIdentity({
      subject: "auth-manager",
      email: "manager@example.com",
      name: "Manager",
    });

    const brokerId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("brokers", { name: "Broker Org", slug: "broker-org" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-a",
        ownerType: "broker",
        ownerBrokerId: id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      return id;
    });

    await seedProfile(t, {
      authUserId: "auth-manager",
      email: "manager@example.com",
      name: "Manager",
      role: "user",
      currentTenantOrgId: "tenant-a",
    });

    tenantsMock.getMember.mockImplementation(async (_ctx: unknown, tenantOrgId: string, authUserId: string) => {
      if (tenantOrgId === "tenant-a" && authUserId === "auth-manager") {
        return { userId: "auth-manager", role: "manager", status: "active", joinedAt: 1 };
      }
      return null;
    });
    tenantsMock.listInvitations.mockResolvedValue([]);
    tenantsMock.inviteMember.mockResolvedValue({ invitationId: "invite-1" });
    tenantsMock.getInvitation.mockResolvedValue({
      _id: "invite-1",
      organizationId: "tenant-a",
      inviteeIdentifier: "invitee@example.com",
      role: "member",
    });
    tenantsMock.cancelInvitation.mockResolvedValue(undefined);

    const inviteId = await t.withIdentity(managerIdentity).mutation(
      api.shared_logic.agencies.repositories.createTeamInviteForOwner as never,
      {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        email: "invitee@example.com",
        role: "member",
      } as never,
    );

    expect(inviteId).toBe("invite-1");
    expect(tenantsMock.inviteMember).toHaveBeenCalled();

    await t.withIdentity(managerIdentity).mutation(
      api.shared_logic.agencies.repositories.cancelTeamInviteForOwner as never,
      {
        ownerType: "broker",
        ownerBrokerId: brokerId,
        inviteId: "invite-1",
      } as never,
    );

    expect(tenantsMock.cancelInvitation).toHaveBeenCalledWith(expect.anything(), "auth-manager", "invite-1");
  });

  it("allows admins to read explicit-owner team lists across tenants", async () => {
    const t = convexTest(schema, modules);
    const adminIdentity = makeIdentity({
      subject: "auth-admin",
      email: "admin@example.com",
      name: "Admin",
    });

    const brokerId = await t.run(async (ctx) => {
      const id = await ctx.db.insert("brokers", { name: "Broker Org", slug: "broker-org" } as any);
      await ctx.db.insert("tenantOrgLinks", {
        tenantOrgId: "tenant-a",
        ownerType: "broker",
        ownerBrokerId: id,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      } as any);
      return id;
    });

    await seedProfile(t, {
      authUserId: "auth-admin",
      email: "admin@example.com",
      name: "Admin",
      role: "user",
      isAdmin: true,
    });
    await seedProfile(t, {
      authUserId: "auth-owner",
      email: "owner@example.com",
      name: "Owner",
      role: "broker",
      brokerId,
      currentTenantOrgId: "tenant-a",
    });

    tenantsMock.listMembers.mockResolvedValue([
      { userId: "auth-owner", role: "owner", status: "active", joinedAt: 1 },
    ]);

    const members = await t.withIdentity(adminIdentity).query(
      api.shared_logic.agencies.repositories.listTeamMembersByOwner as never,
      { ownerType: "broker", ownerBrokerId: brokerId } as never,
    );

    expect((members as any[])).toHaveLength(1);
  });
});

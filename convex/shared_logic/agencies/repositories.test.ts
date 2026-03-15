import { beforeEach, describe, expect, it, vi } from "vitest";
import { ConvexError } from "convex/values";
import { createOrganizationForAuthUserRecord } from "./repositories";
import { acceptInviteForAuthUserRecord } from "./repositories/invites";
import { tenants } from "../../tenants";

const { mockAuditLog } = vi.hoisted(() => ({
  mockAuditLog: {
    log: vi.fn(async () => undefined),
    logChange: vi.fn(async () => undefined),
  },
}));

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => null),
  getAuthSessionId: vi.fn(async () => null),
}));

vi.mock("../../auditLog", () => ({
  auditLog: mockAuditLog,
}));

const createOrganizationSpy = vi.spyOn(tenants, "createOrganization");
const getInvitationSpy = vi.spyOn(tenants, "getInvitation");
const acceptInvitationSpy = vi.spyOn(tenants, "acceptInvitation");

beforeEach(() => {
  createOrganizationSpy.mockReset();
  createOrganizationSpy.mockResolvedValue("tenant-org-1");
  getInvitationSpy.mockReset();
  getInvitationSpy.mockResolvedValue(null);
  acceptInvitationSpy.mockReset();
  acceptInvitationSpy.mockResolvedValue(undefined);
  mockAuditLog.log.mockClear();
  mockAuditLog.logChange.mockClear();
});

function makeMutationCtx() {
  const userProfiles = new Map<string, any>();
  const brokers = new Map<string, any>();
  const reds = new Map<string, any>();
  const teamInvites = new Map<string, any>();
  const organizationMemberships = new Map<string, any>();
  const tenantOrgLinks = new Map<string, any>();
  const inboxConversations = new Map<string, any>();
  let idCounter = 1;

  const recordsByTable = {
    userProfiles,
    brokers,
    RED: reds,
    teamInvites,
    organizationMemberships,
    tenantOrgLinks,
    inboxConversations,
  } as const;

  type QueryCondition = { field: string; value: unknown };
  type QueryConditionChain = {
    conditions: QueryCondition[];
    eq: (field: string, value: unknown) => QueryConditionChain;
  };

  const createConditionChain = (conditions: QueryCondition[]): QueryConditionChain => ({
    conditions,
    eq(field: string, value: unknown) {
      return createConditionChain([...conditions, { field, value }]);
    },
  });

  const ctx = {
    auth: {
      getUserIdentity: async () => ({
        subject: "auth-user-1",
        email: "owner@example.com",
        name: "Owner",
      }),
    },
    db: {
      query(table: keyof typeof recordsByTable) {
        return {
          withIndex(
            _index: string,
            builder: (q: { eq: (field: string, value: unknown) => QueryConditionChain }) => QueryConditionChain,
          ) {
            const condition = builder({
              eq: (field: string, value: unknown) => createConditionChain([{ field, value }]),
            });
            return {
              collect: async () => {
                const values = Array.from(recordsByTable[table].values());
                return values.filter((entry) =>
                  condition.conditions.every(({ field, value }) => entry?.[field] === value),
                );
              },
              unique: async () => {
                const values = Array.from(recordsByTable[table].values());
                return (
                  values.find((entry) =>
                    condition.conditions.every(({ field, value }) => entry?.[field] === value),
                  ) ??
                  null
                );
              },
              first: async () => {
                const values = Array.from(recordsByTable[table].values());
                return (
                  values.find((entry) =>
                    condition.conditions.every(({ field, value }) => entry?.[field] === value),
                  ) ??
                  null
                );
              },
            };
          },
        };
      },
      async get(id: string) {
        return userProfiles.get(id)
          ?? brokers.get(id)
          ?? reds.get(id)
          ?? teamInvites.get(id)
          ?? organizationMemberships.get(id)
          ?? inboxConversations.get(id)
          ?? null;
      },
      async insert(table: keyof typeof recordsByTable, value: Record<string, unknown>) {
        const id = `${table}-${idCounter++}`;
        recordsByTable[table].set(id, { _id: id, ...value });
        return id;
      },
      async patch(id: string, value: Record<string, unknown>) {
        for (const table of Object.values(recordsByTable)) {
          if (table.has(id)) {
            table.set(id, { ...table.get(id), ...value });
            return;
          }
        }
        throw new Error(`Unknown record ${id}`);
      },
    },
  } as any;

  return {
    ctx,
    userProfiles,
    brokers,
    reds,
    teamInvites,
    organizationMemberships,
    tenantOrgLinks,
  };
}

async function expectConvexErrorCode(
  promise: Promise<unknown>,
  code: string,
  message: string,
) {
  try {
    await promise;
  } catch (error) {
    expect(error).toBeInstanceOf(ConvexError);
    expect((error as ConvexError<any>).data).toMatchObject({ code, message });
    return;
  }

  throw new Error(`Expected ConvexError ${code}`);
}

describe("createOrganizationForAuthUserRecord", () => {
  it("recreates an organization when the profile has a stale broker link", async () => {
    const { ctx, userProfiles, brokers, tenantOrgLinks } = makeMutationCtx();

    userProfiles.set("profile-1", {
      _id: "profile-1",
      authUserId: "auth-user-1",
      email: "owner@example.com",
      name: "Owner",
      brokerId: "brokers-missing",
      role: "broker",
      roleStatus: "approved",
      isActive: true,
      createdAt: 1,
      updatedAt: 1,
    });

    const result = await createOrganizationForAuthUserRecord(ctx, {
      authUserId: "auth-user-1",
      email: "owner@example.com",
      displayName: "Owner",
      name: "Fresh Start Realty",
      type: "broker",
    });

    expect(result.ok).toBe(true);
    expect(result.organization.type).toBe("broker");
    expect(result.organization.slug).toBe("fresh-start-realty");
    expect(createOrganizationSpy).toHaveBeenCalled();

    const profile = userProfiles.get("profile-1");
    expect(profile.brokerId).toBe(result.organization.id);
    expect(profile.REDId).toBeUndefined();
    expect(profile.role).toBe("broker");
    expect(profile.currentTenantOrgId).toBe("tenant-org-1");

    const createdBroker = brokers.get(result.organization.id);
    expect(createdBroker?.name).toBe("Fresh Start Realty");
    expect(createdBroker?.contactEmail).toBe("owner@example.com");

    const link = Array.from(tenantOrgLinks.values())[0];
    expect(link).toMatchObject({
      tenantOrgId: "tenant-org-1",
      ownerType: "broker",
      ownerBrokerId: result.organization.id,
    });
  });

  it("rejects creating a second organization when the existing owner link is still valid", async () => {
    const { ctx, userProfiles, brokers } = makeMutationCtx();

    brokers.set("broker-1", {
      _id: "broker-1",
      name: "Existing Realty",
      slug: "existing-realty",
      status: "active",
      isVerified: false,
    });

    userProfiles.set("profile-1", {
      _id: "profile-1",
      authUserId: "auth-user-1",
      email: "owner@example.com",
      name: "Owner",
      brokerId: "broker-1",
      role: "broker",
      roleStatus: "approved",
      isActive: true,
      createdAt: 1,
      updatedAt: 1,
    });

    await expectConvexErrorCode(
      createOrganizationForAuthUserRecord(ctx, {
        authUserId: "auth-user-1",
        email: "owner@example.com",
        displayName: "Owner",
        name: "Fresh Start Realty",
        type: "broker",
      }),
      "ORGANIZATION_EXISTS",
      "This account already has an organization",
    );
  });
});

describe("acceptInviteForAuthUserRecord", () => {
  it("accepts a valid invite via tenants", async () => {
    const { ctx, userProfiles } = makeMutationCtx();

    userProfiles.set("profile-1", {
      _id: "profile-1",
      authUserId: "auth-user-1",
      email: "member@example.com",
      name: "Member",
      role: "user",
      isActive: true,
      createdAt: 1,
      updatedAt: 1,
    });

    getInvitationSpy.mockResolvedValueOnce({
      _id: "invite-1",
      organizationId: "tenant-org-1",
      inviteeIdentifier: "member@example.com",
      role: "member",
      status: "pending",
      expiresAt: Date.now() + 60_000,
    } as any);

    await acceptInviteForAuthUserRecord(ctx, {
      authUserId: "auth-user-1",
      token: "invite-1",
    });

    expect(acceptInvitationSpy).toHaveBeenCalledWith(
      ctx,
      "invite-1",
      "auth-user-1",
      { acceptingUserIdentifier: "auth-user-1" },
    );
    expect(mockAuditLog.log).toHaveBeenCalled();
  });
});

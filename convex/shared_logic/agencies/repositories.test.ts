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
vi.mock("../../_core/security/authIdentity", () => ({
  getAuthUserId: vi.fn(async () => null),
  getAuthSessionId: vi.fn(async () => null),
}));
vi.mock("../../auditLog", () => ({
  auditLog: mockAuditLog,
}));
const createOrganizationSpy = vi.spyOn(tenants, "createOrganization");
const getInvitationSpy = vi.spyOn(tenants, "getInvitation");
const acceptInvitationSpy = vi.spyOn(tenants, "acceptInvitation");
type TableRecords = Map<string, any>;
type RecordsByTable = {
  userProfiles: TableRecords;
  brokers: TableRecords;
  RED: TableRecords;
  teamInvites: TableRecords;
  organizationMemberships: TableRecords;
  tenantOrgLinks: TableRecords;
  inboxConversations: TableRecords;
};
type QueryCondition = { field: string; value: unknown };
type QueryConditionChain = {
  conditions: QueryCondition[];
  eq: (field: string, value: unknown) => QueryConditionChain;
};
const buildConditionChain = (conditions: QueryCondition[]): QueryConditionChain => ({
  conditions,
  eq(field: string, value: unknown) {
    return buildConditionChain([...conditions, { field, value }]);
  },
});
function matchesAllConditions(entry: any, conditions: QueryCondition[]) {
  return conditions.every(({ field, value }) => entry?.[field] === value);
}
function makeIndexedResult(tableRecords: TableRecords, conditions: QueryCondition[]) {
  const values = Array.from(tableRecords.values());
  const filtered = values.filter((entry) => matchesAllConditions(entry, conditions));
  return {
    collect: async () => filtered,
    unique: async () => filtered[0] ?? null,
    first: async () => filtered[0] ?? null,
  };
}
function makeIndexConditionBuilder() {
  return {
    eq: (field: string, value: unknown) => buildConditionChain([{ field, value }]),
  };
}
function findRecordById(recordsByTable: RecordsByTable, id: string) {
  return recordsByTable.userProfiles.get(id)
    ?? recordsByTable.brokers.get(id)
    ?? recordsByTable.RED.get(id)
    ?? recordsByTable.teamInvites.get(id)
    ?? recordsByTable.organizationMemberships.get(id)
    ?? recordsByTable.inboxConversations.get(id)
    ?? null;
}
function makeDb(recordsByTable: RecordsByTable) {
  let idCounter = 1;
  return {
    query(table: keyof RecordsByTable) {
      return {
        withIndex(
          _index: string,
          builder: (q: { eq: (field: string, value: unknown) => QueryConditionChain }) => QueryConditionChain,
        ) {
          const condition = builder(makeIndexConditionBuilder());
          return makeIndexedResult(recordsByTable[table], condition.conditions);
        },
      };
    },
    async get(id: string) {
      return findRecordById(recordsByTable, id);
    },
    async insert(table: keyof RecordsByTable, value: Record<string, unknown>) {
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
  };
}
function makeMutationCtx() {
  const recordsByTable: RecordsByTable = {
    userProfiles: new Map<string, any>(),
    brokers: new Map<string, any>(),
    RED: new Map<string, any>(),
    teamInvites: new Map<string, any>(),
    organizationMemberships: new Map<string, any>(),
    tenantOrgLinks: new Map<string, any>(),
    inboxConversations: new Map<string, any>(),
  };
  const ctx = {
    auth: {
      getUserIdentity: async () => ({
        subject: "auth-user-1",
        email: "owner@example.com",
        name: "Owner",
      }),
    },
    db: makeDb(recordsByTable),
  } as any;
  return {
    ctx,
    userProfiles: recordsByTable.userProfiles,
    brokers: recordsByTable.brokers,
    reds: recordsByTable.RED,
    teamInvites: recordsByTable.teamInvites,
    organizationMemberships: recordsByTable.organizationMemberships,
    tenantOrgLinks: recordsByTable.tenantOrgLinks,
  };
}
function seedStaleBrokerProfile(userProfiles: Map<string, any>) {
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
}
function seedExistingBrokerOwner(userProfiles: Map<string, any>, brokers: Map<string, any>) {
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
}
function expectBrokerProvisioningResult(
  result: Awaited<ReturnType<typeof createOrganizationForAuthUserRecord>>,
  userProfiles: Map<string, any>,
  brokers: Map<string, any>,
  tenantOrgLinks: Map<string, any>,
) {
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
}
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
    seedStaleBrokerProfile(userProfiles);
    const result = await createOrganizationForAuthUserRecord(ctx, {
      authUserId: "auth-user-1",
      email: "owner@example.com",
      displayName: "Owner",
      name: "Fresh Start Realty",
      type: "broker",
    });
    expectBrokerProvisioningResult(result, userProfiles, brokers, tenantOrgLinks);
  });
  it("rejects creating a second organization when the existing owner link is still valid", async () => {
    const { ctx, userProfiles, brokers } = makeMutationCtx();
    seedExistingBrokerOwner(userProfiles, brokers);
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

import { describe, expect, it, vi } from "vitest";
import { createOrganizationForAuthUserRecord } from "./repositories";

vi.mock("@convex-dev/auth/server", () => ({
  getAuthUserId: vi.fn(async () => null),
  getAuthSessionId: vi.fn(async () => null),
}));

function makeMutationCtx() {
  const userProfiles = new Map<string, any>();
  const brokers = new Map<string, any>();
  const reds = new Map<string, any>();
  let idCounter = 1;

  const recordsByTable = {
    userProfiles,
    brokers,
    RED: reds,
  } as const;

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
          withIndex(_index: string, builder: (q: { eq: (field: string, value: unknown) => { field: string; value: unknown } }) => { field: string; value: unknown }) {
            const condition = builder({
              eq: (field: string, value: unknown) => ({ field, value }),
            });
            return {
              first: async () => {
                const values = Array.from(recordsByTable[table].values());
                return (
                  values.find((entry) => entry?.[condition.field] === condition.value) ??
                  null
                );
              },
            };
          },
        };
      },
      async get(id: string) {
        return userProfiles.get(id) ?? brokers.get(id) ?? reds.get(id) ?? null;
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
  };
}

describe("createOrganizationForAuthUserRecord", () => {
  it("recreates an organization when the profile has a stale broker link", async () => {
    const { ctx, userProfiles, brokers } = makeMutationCtx();

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

    const profile = userProfiles.get("profile-1");
    expect(profile.brokerId).toBe(result.organization.id);
    expect(profile.REDId).toBeUndefined();
    expect(profile.role).toBe("broker");

    const createdBroker = brokers.get(result.organization.id);
    expect(createdBroker?.name).toBe("Fresh Start Realty");
    expect(createdBroker?.contactEmail).toBe("owner@example.com");
  });
});

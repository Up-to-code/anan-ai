import { describe, expect, it } from "vitest";
import { requireRole, requireSession } from "./accessPolicy";

function makeCtx(params: { identity?: any; profile?: any }) {
  return {
    auth: {
      getUserIdentity: async () => params.identity ?? null,
    },
    db: {
      query: (_table: string) => ({
        withIndex: (_index: string, _builder: any) => ({
          first: async () => params.profile ?? null,
        }),
      }),
      get: async () => null,
    },
  } as any;
}

describe("accessPolicy", () => {
  it("requireSession throws when unauthenticated", async () => {
    const ctx = makeCtx({});
    await expect(requireSession(ctx)).rejects.toMatchObject({
      data: { code: "UNAUTHORIZED" },
    });
  });

  it("requireRole throws FORBIDDEN on disallowed role", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-user-1", tokenIdentifier: "session-1" },
      profile: { role: "broker", brokerId: "broker-1", isActive: true },
    });

    await expect(requireRole(ctx, ["admin"])).rejects.toMatchObject({
      data: { code: "FORBIDDEN" },
    });
  });

  it("requireRole authorizes allowed role", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-user-2", tokenIdentifier: "session-2" },
      profile: {
        role: "broker",
        brokerId: "broker-2",
        roleApprovalStatus: "approved",
        isActive: true,
      },
    });

    const access = await requireRole(ctx, ["broker"]);
    expect(access.authUserId).toBe("auth-user-2");
    expect(access.sessionId).toBe("session-2");
    expect(access.role).toBe("broker");
    expect(access.brokerId).toBe("broker-2");
  });

  it("blocks pending roles", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-user-3", tokenIdentifier: "session-3" },
      profile: {
        role: "broker",
        brokerId: "broker-3",
        roleApprovalStatus: "pending",
        isActive: true,
      },
    });

    await expect(requireRole(ctx, ["broker"])).rejects.toMatchObject({
      data: { code: "ROLE_PENDING" },
    });
  });

  it("blocks rejected roles", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-user-4", tokenIdentifier: "session-4" },
      profile: {
        role: "broker",
        brokerId: "broker-4",
        roleApprovalStatus: "rejected",
        isActive: true,
      },
    });

    await expect(requireRole(ctx, ["broker"])).rejects.toMatchObject({
      data: { code: "ROLE_REJECTED" },
    });
  });

  it("rejects developer roles without a linked developer organization", async () => {
    const ctx = makeCtx({
      identity: { subject: "auth-user-5", tokenIdentifier: "session-5" },
      profile: {
        role: "developer",
        roleApprovalStatus: "approved",
        isActive: true,
      },
    });

    await expect(requireRole(ctx, ["developer"])).rejects.toMatchObject({
      data: { code: "FORBIDDEN" },
    });
  });
});

import { expect, it, vi } from "vitest";
import type { ResolvedSession } from "@/server/auth/session";

vi.mock("@/server/auth/session", () => ({ requireSessionContext: vi.fn() }));

import { getWorkspaceBehaviorForCurrentUser } from "./service";

function createRequireSession(session: ResolvedSession) {
  return vi.fn(async () => session);
}

function createOrganizationsRepository(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    listForCurrentUser: vi.fn(async () => []),
    getCurrentOrganization: vi.fn(async () => null),
    createForUser: vi.fn(),
    listTeamMembers: vi.fn(),
    listTeamInvites: vi.fn(),
    createTeamInvite: vi.fn(),
    cancelTeamInvite: vi.fn(),
    acceptTeamInvite: vi.fn(),
    ...overrides,
  };
}

function createBrokerSession(args: { userId: string; brokerId: string; name?: string; email?: string }) {
  return {
    token: `token-${args.userId}`,
    context: {
      userId: args.userId,
      name: args.name ?? "Ahmed",
      email: args.email ?? "ahmed@example.com",
      role: "broker",
      brokerId: args.brokerId,
      isActive: true,
    },
    profile: { role: "broker", roleApprovalStatus: "approved", brokerId: args.brokerId },
  };
}

function createOrganization(args: { id: string; type: "broker" | "red"; name: string; slug: string }) {
  return {
    ...args,
    organizationId: args.id,
    status: "active" as const,
    isVerified: true,
    legacyOwnerType: args.type === "broker" ? ("broker" as const) : ("RED" as const),
    legacyOwnerId: args.id,
  };
}

it("resolves broker workspace behavior when organization access is blocked", async () => {
  const requireSession = createRequireSession(createBrokerSession({ userId: "user-1", brokerId: "broker-1" }));
  const organizationsRepository = createOrganizationsRepository({
    listForCurrentUser: vi.fn(async () => [createOrganization({ id: "broker-1", type: "broker", name: "Fresh Start Realty", slug: "fresh-start-realty" })]),
    getCurrentOrganization: vi.fn(async () => ({ organization: null, membership: null, accessError: true as const })),
  });

  const behavior = await getWorkspaceBehaviorForCurrentUser({ requireSession, organizationsRepository });

  expect(behavior.audience).toBe("broker");
  expect(behavior.ownerContext).toBeNull();
  expect(behavior.onboarding.needsOrganization).toBe(true);
  expect(behavior.visibleZoneKeys).toContain("projects");
});

it("falls back to the first organization when the current org is not set", async () => {
  const requireSession = createRequireSession(createBrokerSession({ userId: "user-1", brokerId: "broker-1" }));
  const organizationsRepository = createOrganizationsRepository({
    listForCurrentUser: vi.fn(async () => [createOrganization({ id: "broker-1", type: "broker", name: "Fresh Start Realty", slug: "fresh-start-realty" })]),
  });

  const behavior = await getWorkspaceBehaviorForCurrentUser({ requireSession, organizationsRepository });

  expect(behavior.primaryOrganization?.id).toBe("broker-1");
  expect(behavior.onboarding.needsOrganization).toBe(false);
  expect(behavior.ownerContext).toEqual({ ownerType: "broker", ownerId: "broker-1" });
});

it("resolves developer workspace behavior from canonical developer profile links", async () => {
  const requireSession = createRequireSession({
    token: "token-2",
    context: { userId: "user-2", role: "developer", redId: "red-1", isActive: true },
    profile: { role: "developer", developerId: "red-1" },
  });
  const organizationsRepository = createOrganizationsRepository({
    listForCurrentUser: vi.fn(async () => [createOrganization({ id: "red-1", type: "red", name: "Alpha Developments", slug: "alpha-developments" })]),
  });

  const behavior = await getWorkspaceBehaviorForCurrentUser({ requireSession, organizationsRepository });

  expect(behavior.audience).toBe("developer");
  expect(behavior.ownerContext).toEqual({ ownerType: "RED", ownerId: "red-1" });
  expect(behavior.onboarding.needsOrganization).toBe(false);
  expect(behavior.onboarding.suggestedOrganizationType).toBe("red");
});

it("returns onboarding behavior for authenticated users with no organization", async () => {
  const requireSession = createRequireSession({
    token: "token-3",
    context: { userId: "user-3", role: "user", isActive: true },
    profile: { requestedRole: "developer" },
  });

  const behavior = await getWorkspaceBehaviorForCurrentUser({
    requireSession,
    organizationsRepository: createOrganizationsRepository(),
  });

  expect(behavior.primaryOrganization).toBeNull();
  expect(behavior.audience).toBe("developer");
  expect(behavior.onboarding.needsOrganization).toBe(true);
  expect(behavior.onboarding.suggestedOrganizationType).toBe("red");
});

it("prefers the current organization when available", async () => {
  const requireSession = createRequireSession(createBrokerSession({ userId: "user-4", brokerId: "broker-2", name: "Laila", email: "laila@example.com" }));
  const organizationsRepository = createOrganizationsRepository({
    listForCurrentUser: vi.fn(async () => [createOrganization({ id: "broker-1", type: "broker", name: "Legacy Org", slug: "legacy-org" })]),
    getCurrentOrganization: vi.fn(async () => ({
      organization: createOrganization({ id: "broker-2", type: "broker", name: "Primary Org", slug: "primary-org" }),
      membership: {
        id: "member-1",
        ownerType: "broker" as const,
        ownerId: "broker-2",
        authUserId: "user-4",
        profileId: "profile-4",
        role: "manager" as const,
        status: "active" as const,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    })),
  });

  const behavior = await getWorkspaceBehaviorForCurrentUser({ requireSession, organizationsRepository });

  expect(behavior.primaryOrganization?.id).toBe("broker-2");
  expect(behavior.organizations[0]?.id).toBe("broker-2");
});

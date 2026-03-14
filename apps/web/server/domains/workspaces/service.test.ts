import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  getWorkspaceBehaviorForCurrentUser,
  getWorkspaceSnapshotForCurrentUser,
} from "./service";

describe("workspaces domain service", () => {
  it("builds the workspace snapshot from the current session and organizations repository", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-1",
      context: {
        userId: "user-1",
        name: "Ahmed",
        email: "ahmed@example.com",
        role: "broker",
        brokerId: "broker-1",
        isActive: true,
      },
      profile: {
        role: "broker",
        roleStatus: "approved",
        brokerId: "broker-1",
      },
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(async () => [
        {
          id: "broker-1",
          type: "broker" as const,
          name: "Fresh Start Realty",
          slug: "fresh-start-realty",
          status: "active" as const,
          isVerified: false,
        },
      ]),
      createForUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const snapshot = await getWorkspaceSnapshotForCurrentUser({
      requireSession,
      organizationsRepository,
    });

    expect(snapshot.user).toEqual({
      id: "user-1",
      name: "Ahmed",
      email: "ahmed@example.com",
      image: undefined,
      isActive: true,
    });
    expect(snapshot.profile?.role).toBe("broker");
    expect(snapshot.organizations[0]?.slug).toBe("fresh-start-realty");
    expect(organizationsRepository.listForCurrentUser).toHaveBeenCalledWith("token-1");
  });

  it("resolves broker workspace behavior with centralized audience and owner context", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-1",
      context: {
        userId: "user-1",
        name: "Ahmed",
        email: "ahmed@example.com",
        role: "broker",
        brokerId: "broker-1",
        isActive: true,
      },
      profile: {
        role: "broker",
        roleStatus: "approved",
        brokerId: "broker-1",
      },
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(async () => [
        {
          id: "broker-1",
          type: "broker" as const,
          name: "Fresh Start Realty",
          slug: "fresh-start-realty",
          status: "active" as const,
          isVerified: true,
        },
      ]),
      createForUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const behavior = await getWorkspaceBehaviorForCurrentUser({
      requireSession,
      organizationsRepository,
    });

    expect(behavior.audience).toBe("broker");
    expect(behavior.ownerContext).toEqual({ ownerType: "broker", ownerId: "broker-1" });
    expect(behavior.onboarding.needsOrganization).toBe(false);
    expect(behavior.visibleZoneKeys).toContain("projects");
  });

  it("normalizes legacy RED roles into the developer audience", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-2",
      context: {
        userId: "user-2",
        role: "RED",
        redId: "red-1",
        isActive: true,
      },
      profile: {
        role: "RED",
        REDId: "red-1",
      },
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(async () => [
        {
          id: "red-1",
          type: "red" as const,
          name: "Alpha Developments",
          slug: "alpha-developments",
          status: "active" as const,
          isVerified: true,
        },
      ]),
      createForUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const behavior = await getWorkspaceBehaviorForCurrentUser({
      requireSession,
      organizationsRepository,
    });

    expect(behavior.audience).toBe("developer");
    expect(behavior.ownerContext).toEqual({ ownerType: "RED", ownerId: "red-1" });
    expect(behavior.onboarding.suggestedOrganizationType).toBe("red");
  });

  it("returns onboarding behavior for authenticated users with no organization", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-3",
      context: {
        userId: "user-3",
        role: "user",
        isActive: true,
      },
      profile: {
        requestedRole: "developer",
      },
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(async () => []),
      createForUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const behavior = await getWorkspaceBehaviorForCurrentUser({
      requireSession,
      organizationsRepository,
    });

    expect(behavior.primaryOrganization).toBeNull();
    expect(behavior.audience).toBe("developer");
    expect(behavior.onboarding.needsOrganization).toBe(true);
    expect(behavior.onboarding.suggestedOrganizationType).toBe("red");
  });
});

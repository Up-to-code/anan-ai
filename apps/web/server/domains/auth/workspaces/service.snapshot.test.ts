import { expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { getWorkspaceSnapshotForCurrentUser } from "./service";

function createRequireSessionMock() {
  return vi.fn(async () => ({
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
      roleApprovalStatus: "approved",
      brokerId: "broker-1",
    },
  }));
}

function createOrganizationsRepositoryMock() {
  return {
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
    getCurrentOrganization: vi.fn(async () => null),
    createForUser: vi.fn(),
    listTeamMembers: vi.fn(),
    listTeamInvites: vi.fn(),
    createTeamInvite: vi.fn(),
    cancelTeamInvite: vi.fn(),
    acceptTeamInvite: vi.fn(),
  };
}

it("builds the workspace snapshot from the current session and organizations repository", async () => {
  const requireSession = createRequireSessionMock();
  const organizationsRepository = createOrganizationsRepositoryMock();

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

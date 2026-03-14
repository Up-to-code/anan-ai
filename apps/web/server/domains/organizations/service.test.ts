import { describe, expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import { createOrganizationForCurrentUser, listOrganizationsForCurrentUser } from "./service";

describe("organizations domain service", () => {
  it("validates create payloads before calling the repository", async () => {
    const requireSession = vi.fn();
    const organizationsRepository = {
      listForCurrentUser: vi.fn(),
      createForCurrentUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    await expect(
      createOrganizationForCurrentUser(
        { name: "A", type: "broker" },
        { requireSession, organizationsRepository },
      ),
    ).rejects.toBeInstanceOf(DomainError);

    expect(requireSession).not.toHaveBeenCalled();
    expect(organizationsRepository.createForCurrentUser).not.toHaveBeenCalled();
  });

  it("delegates organization creation to the repository for non-admin sessions", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-1",
      context: {
        userId: "user-1",
        role: "user",
        isActive: true,
      },
      profile: null,
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(),
      createForCurrentUser: vi.fn(async () => ({
        id: "broker-1",
        type: "broker" as const,
        name: "Fresh Start Realty",
        slug: "fresh-start-realty",
        status: "active" as const,
        isVerified: false,
      })),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const organization = await createOrganizationForCurrentUser(
      { name: "Fresh Start Realty", type: "broker" },
      { requireSession, organizationsRepository },
    );

    expect(organizationsRepository.createForCurrentUser).toHaveBeenCalledWith("token-1", {
      name: "Fresh Start Realty",
      type: "broker",
    });
    expect(organization.slug).toBe("fresh-start-realty");
  });

  it("infers the organization type when the UI does not send one", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-2",
      context: {
        userId: "user-2",
        role: "user",
        isActive: true,
      },
      profile: {
        requestedRole: "developer",
      },
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(),
      createForCurrentUser: vi.fn(async () => ({
        id: "red-1",
        type: "red" as const,
        name: "Alpha Developments",
        slug: "alpha-developments",
        status: "active" as const,
        isVerified: false,
      })),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    await createOrganizationForCurrentUser(
      { name: "Alpha Developments" },
      { requireSession, organizationsRepository },
    );

    expect(organizationsRepository.createForCurrentUser).toHaveBeenCalledWith("token-2", {
      name: "Alpha Developments",
      type: "red",
    });
  });

  it("lists organizations through the repository", async () => {
    const requireSession = vi.fn(async () => ({
      token: "token-1",
      context: {
        userId: "user-1",
        isActive: true,
      },
      profile: null,
    }));
    const organizationsRepository = {
      listForCurrentUser: vi.fn(async () => [
        {
          id: "broker-1",
          type: "broker" as const,
          name: "Alpha",
          slug: "alpha",
          status: "active" as const,
          isVerified: false,
        },
      ]),
      createForCurrentUser: vi.fn(),
      listTeamMembers: vi.fn(),
      listTeamInvites: vi.fn(),
      createTeamInvite: vi.fn(),
      cancelTeamInvite: vi.fn(),
      acceptTeamInvite: vi.fn(),
    };

    const organizations = await listOrganizationsForCurrentUser({
      requireSession,
      organizationsRepository,
    });

    expect(organizations).toHaveLength(1);
    expect(organizationsRepository.listForCurrentUser).toHaveBeenCalledWith("token-1");
  });
});

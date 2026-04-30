import { expect, it, vi } from "vitest";
import { DomainError } from "@/server/contracts/errors";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

import {
  bootstrapCurrentOrganizationFromBetterAuth,
  createOrganizationForCurrentUser,
  listOrganizationsForCurrentUser,
  syncCurrentOrganizationFromBetterAuth,
} from "./service";

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
      { name: "A", type: "broker", countryCode: "SA" },
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
    { name: "Fresh Start Realty", type: "broker", countryCode: "AE" },
    { requireSession, organizationsRepository },
  );

  expect(organizationsRepository.createForCurrentUser).toHaveBeenCalledWith("token-1", {
    name: "Fresh Start Realty",
    type: "broker",
    countryCode: "AE",
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
    { name: "Alpha Developments", countryCode: "QA" },
    { requireSession, organizationsRepository },
  );

  expect(organizationsRepository.createForCurrentUser).toHaveBeenCalledWith("token-2", {
    name: "Alpha Developments",
    type: "red",
    countryCode: "QA",
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

it("bootstraps the current organization bridge without an active org claim", async () => {
  const requireSession = vi.fn(async () => ({
    token: "token-3",
    context: {
      userId: "user-3",
      role: "broker",
      isActive: true,
      organizationId: null,
    },
    profile: null,
  }));
  const organizationProfilesRepository = {
    listByOrganizationIds: vi.fn(),
    getCurrent: vi.fn(),
    getById: vi.fn(),
    bootstrapCurrent: vi.fn(async () => ({
      id: "org_3",
      organizationId: "org_3",
      type: "broker" as const,
      name: "Bridge Org",
      slug: "bridge-org",
      status: "active" as const,
      isVerified: false,
      legacyOwnerType: "broker" as const,
      legacyOwnerId: "broker-3",
    })),
    syncCurrent: vi.fn(),
    updateCurrent: vi.fn(),
  };

  const result = await bootstrapCurrentOrganizationFromBetterAuth(
    {
      organizationId: "org_3",
      name: "Bridge Org",
      type: "broker",
      countryCode: "SA",
    },
    {
      requireSession,
      organizationsRepository: {} as any,
      organizationProfilesRepository: organizationProfilesRepository as any,
    },
  );

  expect(organizationProfilesRepository.bootstrapCurrent).toHaveBeenCalledWith("token-3", {
    organizationId: "org_3",
    name: "Bridge Org",
    type: "broker",
    countryCode: "SA",
  });
  expect(result.id).toBe("org_3");
});

it("rejects bootstrap when the session active org mismatches the requested org id", async () => {
  const requireSession = vi.fn(async () => ({
    token: "token-4",
    context: {
      userId: "user-4",
      role: "broker",
      isActive: true,
      organizationId: "org_active",
    },
    profile: null,
  }));

  await expect(
    bootstrapCurrentOrganizationFromBetterAuth(
      {
        organizationId: "org_other",
        name: "Other Org",
        type: "broker",
        countryCode: "AE",
      },
      {
        requireSession,
        organizationsRepository: {} as any,
        organizationProfilesRepository: {} as any,
      },
    ),
  ).rejects.toBeInstanceOf(DomainError);
});

it("skips current organization sync when the session has no active org claim", async () => {
  const requireSession = vi.fn(async () => ({
    token: "token-no-org",
    context: {
      userId: "user-no-org",
      role: "broker",
      isActive: true,
      organizationId: null,
    },
    profile: null,
  }));
  const organizationProfilesRepository = {
    listByOrganizationIds: vi.fn(),
    getCurrent: vi.fn(),
    getById: vi.fn(),
    bootstrapCurrent: vi.fn(),
    syncCurrent: vi.fn(),
    updateCurrent: vi.fn(),
  };

  const result = await syncCurrentOrganizationFromBetterAuth({
    requireSession,
    organizationsRepository: {} as any,
    organizationProfilesRepository: organizationProfilesRepository as any,
  });

  expect(result).toBeNull();
  expect(organizationProfilesRepository.syncCurrent).not.toHaveBeenCalled();
});

it("syncs current organization when the active org claim is present", async () => {
  const requireSession = vi.fn(async () => ({
    token: "token-with-org",
    context: {
      userId: "user-with-org",
      role: "broker",
      isActive: true,
      organizationId: "org_active",
    },
    profile: null,
  }));
  const organizationProfilesRepository = {
    listByOrganizationIds: vi.fn(),
    getCurrent: vi.fn(),
    getById: vi.fn(),
    bootstrapCurrent: vi.fn(),
    syncCurrent: vi.fn(async () => ({
      id: "org_active",
      organizationId: "org_active",
      type: "broker" as const,
      name: "Active Org",
      slug: "active-org",
      status: "active" as const,
      isVerified: false,
    })),
    updateCurrent: vi.fn(),
  };

  const result = await syncCurrentOrganizationFromBetterAuth({
    requireSession,
    organizationsRepository: {} as any,
    organizationProfilesRepository: organizationProfilesRepository as any,
  });

  expect(organizationProfilesRepository.syncCurrent).toHaveBeenCalledWith("token-with-org");
  expect(result?.organizationId).toBe("org_active");
});

import { beforeEach, expect, it, vi } from "vitest";

vi.mock("@/server/auth/session", () => ({
  requireSessionContext: vi.fn(),
}));

vi.mock("@/server/infrastructure/betterAuth/organizations", () => ({
  betterAuthOrganizationsRepository: {
    listForCurrentUser: vi.fn(),
  },
}));

vi.mock("@/server/infrastructure/convex/organizationProfiles", () => ({
  convexOrganizationProfilesRepository: {
    getCurrent: vi.fn(),
    getById: vi.fn(),
  },
}));

import { requireSessionContext } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import { betterAuthOrganizationsRepository } from "@/server/infrastructure/betterAuth/organizations";
import { convexOrganizationProfilesRepository } from "@/server/infrastructure/convex/organizationProfiles";
import {
  requireAdminSession,
  requireBrokerSession,
  requireDeveloperSession,
} from "./guards";

beforeEach(() => {
  vi.mocked(requireSessionContext).mockReset();
  vi.mocked(betterAuthOrganizationsRepository.listForCurrentUser).mockReset();
  vi.mocked(convexOrganizationProfilesRepository.getCurrent).mockReset();
  vi.mocked(convexOrganizationProfilesRepository.getById).mockReset();
});

it("accepts broker sessions with a broker link", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", brokerId: "broker-1", isActive: true },
    profile: null,
  });

  await expect(requireBrokerSession()).resolves.toMatchObject({
    context: { brokerId: "broker-1" },
  });
});

it("accepts broker sessions via current organization fallback", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", organizationId: "org-1", isActive: true },
    profile: null,
  });
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-1",
    organizationId: "org-1",
    type: "broker",
    name: "Org",
    slug: "org",
    status: "active",
    isVerified: false,
    legacyOwnerType: "broker",
    legacyOwnerId: "broker-bridge-1",
  });

  await expect(requireBrokerSession()).resolves.toMatchObject({
    context: { brokerId: "broker-bridge-1" },
  });
});

it("accepts broker sessions via organization id when the legacy bridge is still missing", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", organizationId: "org-bridge-pending", isActive: true },
    profile: null,
  });
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-bridge-pending",
    organizationId: "org-bridge-pending",
    type: "broker",
    name: "Bridge Pending Org",
    slug: "bridge-pending-org",
    status: "active",
    isVerified: false,
    legacyOwnerType: null,
    legacyOwnerId: null,
  });

  await expect(requireBrokerSession()).resolves.toMatchObject({
    context: { brokerId: "org-bridge-pending" },
  });
});

it("accepts broker sessions via first-organization fallback when the active org claim is stale", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", isActive: true },
    profile: null,
  });
  vi.mocked(betterAuthOrganizationsRepository.listForCurrentUser).mockResolvedValue([
    {
      id: "org-3",
      organizationId: "org-3",
      type: "broker",
      name: "Fallback Org",
      slug: "fallback-org",
      status: "active",
      isVerified: false,
      legacyOwnerType: "broker",
      legacyOwnerId: "broker-bridge-3",
    },
  ]);
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-3",
    organizationId: "org-3",
    type: "broker",
    name: "Fallback Org",
    slug: "fallback-org",
    status: "active",
    isVerified: false,
    legacyOwnerType: "broker",
    legacyOwnerId: "broker-bridge-3",
  });

  await expect(requireBrokerSession()).resolves.toMatchObject({
    context: { organizationId: "org-3", brokerId: "broker-bridge-3" },
  });
});

it("rejects broker sessions without a linked broker", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", isActive: true },
    profile: null,
  });
  vi.mocked(betterAuthOrganizationsRepository.listForCurrentUser).mockResolvedValue([
    {
      id: "org-4",
      organizationId: "org-4",
      type: "broker",
      name: "Orphan Org",
      slug: "orphan-org",
      status: "active",
      isVerified: false,
      legacyOwnerType: "broker",
      legacyOwnerId: "broker-orphan",
    },
  ]);
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue(null);

  await expect(requireBrokerSession()).rejects.toBeInstanceOf(DomainError);
});

it("accepts developer sessions with a linked developer owner", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "developer", redId: "red-1", isActive: true },
    profile: null,
  });

  await expect(requireDeveloperSession()).resolves.toMatchObject({
    context: { redId: "red-1" },
  });
});

it("accepts developer sessions via current organization fallback", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "developer", organizationId: "org-2", isActive: true },
    profile: null,
  });
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-2",
    organizationId: "org-2",
    type: "red",
    name: "Org",
    slug: "org",
    status: "active",
    isVerified: false,
    legacyOwnerType: "RED",
    legacyOwnerId: "red-bridge-1",
  });

  await expect(requireDeveloperSession()).resolves.toMatchObject({
    context: { redId: "red-bridge-1" },
  });
});

it("accepts developer sessions via organization id when the legacy bridge is still missing", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "developer", organizationId: "org-dev-pending", isActive: true },
    profile: null,
  });
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-dev-pending",
    organizationId: "org-dev-pending",
    type: "red",
    name: "Bridge Pending Developer",
    slug: "bridge-pending-developer",
    status: "active",
    isVerified: false,
    legacyOwnerType: null,
    legacyOwnerId: null,
  });

  await expect(requireDeveloperSession()).resolves.toMatchObject({
    context: { redId: "org-dev-pending" },
  });
});

it("accepts developer sessions via first-organization fallback when the active org claim is stale", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "developer", isActive: true },
    profile: null,
  });
  vi.mocked(betterAuthOrganizationsRepository.listForCurrentUser).mockResolvedValue([
    {
      id: "org-5",
      organizationId: "org-5",
      type: "red",
      name: "Fallback Dev Org",
      slug: "fallback-dev-org",
      status: "active",
      isVerified: false,
      legacyOwnerType: "RED",
      legacyOwnerId: "red-bridge-5",
    },
  ]);
  vi.mocked(convexOrganizationProfilesRepository.getById).mockResolvedValue({
    id: "org-5",
    organizationId: "org-5",
    type: "red",
    name: "Fallback Dev Org",
    slug: "fallback-dev-org",
    status: "active",
    isVerified: false,
    legacyOwnerType: "RED",
    legacyOwnerId: "red-bridge-5",
  });

  await expect(requireDeveloperSession()).resolves.toMatchObject({
    context: { organizationId: "org-5", redId: "red-bridge-5" },
  });
});

it("rejects non-admin sessions from admin guard", async () => {
  vi.mocked(requireSessionContext).mockResolvedValue({
    token: "token",
    context: { userId: "u1", role: "broker", brokerId: "broker-1", isActive: true },
    profile: null,
  });

  await expect(requireAdminSession()).rejects.toBeInstanceOf(DomainError);
});

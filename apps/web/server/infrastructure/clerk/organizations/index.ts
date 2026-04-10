import { auth, clerkClient } from "@clerk/nextjs/server";
import { convexOrganizationProfilesRepository } from "@/server/infrastructure/convex/organizationProfiles";
import {
  convexOrganizationsRepository as legacyOrganizationsRepository,
  type CurrentOrganizationResult,
  type OrganizationsRepository,
} from "@/server/infrastructure/convex/organizations";
import type {
  DirectorySearchResult,
  IncomingOrganizationInvite,
  OfferOrganizationSummary,
  OffersDirectoryProfile,
  OrganizationInviteSummary,
  OrganizationMembershipSummary,
  OrganizationPublicProfile,
  OrganizationSummary,
  OrganizationTeamMember,
  UpdateOrganizationInput,
} from "@/server/contracts/organizations";

function normalizeOrganizationType(value: unknown): "broker" | "red" {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  if (normalized.includes("developer") || normalized === "red") {
    return "red";
  }
  return "broker";
}

function normalizeInviteOrganizationType(value: unknown): "broker" | "developer" {
  return normalizeOrganizationType(value) === "red" ? "developer" : "broker";
}

function normalizeMembershipRole(value: unknown): "manager" | "member" | "viewer" {
  const normalized = typeof value === "string" ? value.toLowerCase() : "";
  if (normalized.includes("owner") || normalized.includes("admin") || normalized.includes("manager")) {
    return "manager";
  }
  if (normalized.includes("viewer")) {
    return "viewer";
  }
  return "member";
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value : undefined;
}

function resolveOrganizationSlug(organization: Record<string, unknown>) {
  return (
    readString(organization.slug) ??
    readString(organization.name)
      ?.toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") ??
    `org-${String(organization.id ?? "unknown")}`
  );
}

function mapOrganizationSummary(args: {
  organization: Record<string, unknown>;
  profile?: OrganizationSummary | null;
}): OrganizationSummary {
  const profile = args.profile ?? null;
  return {
    id: readString(args.organization.id) ?? profile?.id ?? "",
    organizationId: readString(args.organization.id) ?? profile?.organizationId,
    type: profile?.type ?? normalizeOrganizationType((args.organization.publicMetadata as Record<string, unknown> | undefined)?.organizationType),
    name: readString(args.organization.name) ?? profile?.name ?? "Organization",
    slug: profile?.slug ?? resolveOrganizationSlug(args.organization),
    status: profile?.status ?? "active",
    isVerified: profile?.isVerified ?? false,
    logoUrl: readString(args.organization.imageUrl) ?? profile?.logoUrl ?? null,
    description: profile?.description,
    website: profile?.website,
    contactEmail: profile?.contactEmail,
    phone: profile?.phone,
    legacyOwnerType: profile?.legacyOwnerType ?? null,
    legacyOwnerId: profile?.legacyOwnerId ?? null,
    legacyTenantOrgId: profile?.legacyTenantOrgId ?? null,
  };
}

function mapMembershipSummary(args: {
  authUserId: string;
  membership: Record<string, unknown>;
  organization: OrganizationSummary;
}): OrganizationMembershipSummary {
  const rawRole = readString(args.membership.role);
  return {
    id: readString(args.membership.id) ?? `${args.organization.id}:${args.authUserId}`,
    ownerType: args.organization.legacyOwnerType ?? undefined,
    ownerId: args.organization.legacyOwnerId ?? undefined,
    authUserId: args.authUserId,
    profileId: undefined,
    role: normalizeMembershipRole(rawRole),
    tenantRole: rawRole,
    status: "active",
    createdAt: Number(args.membership.createdAt ?? Date.now()),
    updatedAt: Number(args.membership.updatedAt ?? args.membership.createdAt ?? Date.now()),
  };
}

async function getClerkContext() {
  const { userId, orgId } = await auth();
  return { userId: userId ?? null, orgId: orgId ?? null };
}

function mapClerkRole(
  role: "manager" | "member" | "viewer",
): "org:admin" | "org:member" | "org:viewer" {
  if (role === "manager") {
    return "org:admin";
  }

  if (role === "viewer") {
    return "org:viewer";
  }

  return "org:member";
}

async function listClerkMemberships(userId: string) {
  const client = await clerkClient();
  const result = await client.users.getOrganizationMembershipList({
    userId,
    limit: 100,
  });
  return Array.isArray(result?.data) ? (result.data as unknown as Record<string, unknown>[]) : [];
}

async function listOrganizationProfiles(token: string, organizationIds: string[]) {
  const profiles = await convexOrganizationProfilesRepository.listByOrganizationIds(token, organizationIds);
  return new Map(profiles.map((profile) => [profile.organizationId ?? profile.id, profile]));
}

/**
 * WHY:   The workspace is moving to Clerk Organizations for membership truth while business zones still need
 *        the local Convex metadata bridge during migration.
 * WHAT:  Hybrid Clerk-first repository with legacy Convex fallback.
 * HOW:   Reads org memberships/invites/settings from Clerk, enriches them with Convex `organizationProfiles`,
 *        and falls back to the legacy tenant repository when no Clerk org context exists yet.
 */
export const clerkOrganizationsRepository: OrganizationsRepository = {
  async listForCurrentUser(token) {
    const { userId } = await getClerkContext();
    if (!userId) {
      return [];
    }

    const memberships = await listClerkMemberships(userId);
    if (memberships.length === 0) {
      return legacyOrganizationsRepository.listForCurrentUser(token);
    }

    const organizationIds = memberships
      .map((membership) => readString((membership.organization as Record<string, unknown> | undefined)?.id))
      .filter((value): value is string => Boolean(value));
    const profileMap = await listOrganizationProfiles(token, organizationIds);

    return memberships
      .map((membership) => {
        const organization = membership.organization as Record<string, unknown> | undefined;
        if (!organization) {
          return null;
        }
        const organizationId = readString(organization.id);
        return mapOrganizationSummary({
          organization,
          profile: organizationId ? profileMap.get(organizationId) ?? null : null,
        });
      })
      .filter((entry): entry is OrganizationSummary => Boolean(entry));
  },

  async createForCurrentUser(token, input) {
    return legacyOrganizationsRepository.createForCurrentUser(token, input);
  },

  async getCurrentOrganization(token): Promise<CurrentOrganizationResult> {
    const { userId, orgId } = await getClerkContext();
    if (!userId || !orgId) {
      return legacyOrganizationsRepository.getCurrentOrganization(token);
    }

    const memberships = await listClerkMemberships(userId);
    const activeMembership = memberships.find(
      (membership) => readString((membership.organization as Record<string, unknown> | undefined)?.id) === orgId,
    );
    if (!activeMembership) {
      return legacyOrganizationsRepository.getCurrentOrganization(token);
    }

    const client = await clerkClient();
    const organizationRecord =
      ((await client.organizations.getOrganization({ organizationId: orgId })) as unknown as
        | Record<string, unknown>
        | undefined) ?? (activeMembership.organization as Record<string, unknown> | undefined);
    if (!organizationRecord) {
      return legacyOrganizationsRepository.getCurrentOrganization(token);
    }

    await convexOrganizationProfilesRepository.syncCurrent(token).catch(() => null);
    const profile = await convexOrganizationProfilesRepository.getCurrent(token);
    const organization = mapOrganizationSummary({
      organization: organizationRecord,
      profile,
    });

    return {
      organization,
      membership: mapMembershipSummary({
        authUserId: userId,
        membership: activeMembership,
        organization,
      }),
    };
  },

  async updateCurrentOrganization(token, input: UpdateOrganizationInput) {
    const { orgId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.updateCurrentOrganization(token, input);
    }

    const client = await clerkClient();
    if (input.name.trim().length > 0) {
      await client.organizations.updateOrganization(orgId, {
        name: input.name,
      });
    }

    return convexOrganizationProfilesRepository.updateCurrent(token, input);
  },

  async listCurrentTeamMembers(token) {
    const { orgId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.listCurrentTeamMembers(token);
    }

    const client = await clerkClient();
    const memberships = await client.organizations.getOrganizationMembershipList({
      organizationId: orgId,
      limit: 100,
    });

    return memberships.data.map((membership: any): OrganizationTeamMember => {
      const publicUserData = (membership.publicUserData ?? {}) as Record<string, unknown>;
      const firstName = readString(publicUserData.firstName);
      const lastName = readString(publicUserData.lastName);
      const email = readString(publicUserData.identifier) ?? readString(publicUserData.emailAddress) ?? "";
      const name = [firstName, lastName].filter(Boolean).join(" ").trim() || email || "مستخدم عنان";
      return {
        id: readString(publicUserData.userId) ?? readString(membership.id) ?? name,
        membershipId: readString(publicUserData.userId) ?? readString(membership.id),
        authUserId: readString(publicUserData.userId) ?? readString(membership.id) ?? "",
        name,
        email,
        username: undefined,
        role: normalizeMembershipRole(membership.role),
        roleApprovalStatus: undefined,
        isActive: true,
      };
    });
  },

  async listCurrentTeamInvites(token) {
    const { orgId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.listCurrentTeamInvites(token);
    }

    const client = await clerkClient();
    const result = await client.organizations.getOrganizationInvitationList({
      organizationId: orgId,
      limit: 100,
    });
    const invitations = Array.isArray(result?.data) ? (result.data as unknown as Record<string, unknown>[]) : [];

    return invitations.map((invite): OrganizationInviteSummary => ({
      id: readString(invite.id) ?? crypto.randomUUID(),
      email: readString(invite.emailAddress) ?? "",
      role: normalizeMembershipRole(invite.role),
      status:
        invite.status === "revoked"
          ? "canceled"
          : invite.status === "accepted"
            ? "accepted"
            : "pending",
      token: readString(invite.id) ?? "",
      expiresAt: Number(invite.expiresAt ?? Date.now()),
      acceptedAt: typeof invite.acceptedAt === "number" ? invite.acceptedAt : undefined,
    }));
  },

  async createCurrentTeamInvite(token, input) {
    const { orgId, userId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.createCurrentTeamInvite(token, input);
    }

    const client = await clerkClient();
    const currentOrganization = await this.getCurrentOrganization(token);
    const inviter =
      userId
        ? await client.users.getUser(userId).catch(() => null)
        : null;
    const inviterName =
      [readString(inviter?.firstName), readString(inviter?.lastName)].filter(Boolean).join(" ").trim() ||
      readString(inviter?.username) ||
      readString(inviter?.primaryEmailAddress?.emailAddress) ||
      "Anan";
    const invitation = await client.organizations.createOrganizationInvitation({
      organizationId: orgId,
      emailAddress: input.email,
      role: mapClerkRole(input.role),
      redirectUrl: `${process.env.ANAN_WEB_URL ?? process.env.SITE_URL ?? ""}/ws`,
      publicMetadata: {
        source: "workspace_settings",
        role: input.role,
        organizationName: currentOrganization?.organization?.name ?? "Organization",
        organizationType:
          currentOrganization?.organization?.type === "red" ? "developer" : "broker",
        inviterName,
        inviterAuthUserId: userId ?? "",
      },
    });

    return readString(invitation?.id) ?? "";
  },

  async cancelCurrentTeamInvite(token, inviteId) {
    const { orgId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.cancelCurrentTeamInvite(token, inviteId);
    }

    const client = await clerkClient();
    await client.organizations.revokeOrganizationInvitation({
      organizationId: orgId,
      invitationId: inviteId,
      requestingUserId: (await getClerkContext()).userId ?? undefined,
    });
  },

  async updateCurrentTeamMemberRole(token, { membershipId, input }) {
    const { orgId } = await getClerkContext();
    if (!orgId) {
      return legacyOrganizationsRepository.updateCurrentTeamMemberRole(token, {
        membershipId,
        input,
      });
    }

    const client = await clerkClient();
    await client.organizations.updateOrganizationMembership({
      organizationId: orgId,
      userId: membershipId,
      role: mapClerkRole(input.role),
    });
  },

  async acceptCurrentTeamInvite(authToken, inviteToken) {
    return legacyOrganizationsRepository.acceptCurrentTeamInvite(authToken, inviteToken);
  },

  async searchDirectoryExact(token, query): Promise<DirectorySearchResult[]> {
    return legacyOrganizationsRepository.searchDirectoryExact(token, query);
  },

  async listOffersDirectoryProfiles(token, role): Promise<OffersDirectoryProfile[]> {
    return legacyOrganizationsRepository.listOffersDirectoryProfiles(token, role);
  },

  async listOfferOrganizationsDirectory(token, role): Promise<OfferOrganizationSummary[]> {
    return legacyOrganizationsRepository.listOfferOrganizationsDirectory(token, role);
  },

  async getOrganizationPublicProfile(token, type, slug): Promise<OrganizationPublicProfile | null> {
    return legacyOrganizationsRepository.getOrganizationPublicProfile(token, type, slug);
  },

  async listIncomingTeamInvites(token): Promise<IncomingOrganizationInvite[]> {
    const { userId } = await getClerkContext();
    if (!userId) {
      return legacyOrganizationsRepository.listIncomingTeamInvites(token);
    }

    const client = await clerkClient();
    const invitationsResult = await client.users.getOrganizationInvitationList({
      userId,
      status: "pending",
      limit: 100,
    });
    const invitations = Array.isArray(invitationsResult?.data)
      ? (invitationsResult.data as unknown as Record<string, unknown>[])
      : [];

    if (invitations.length === 0) {
      return legacyOrganizationsRepository.listIncomingTeamInvites(token);
    }

    return invitations.map((invite) => {
      const publicMetadata = (invite.publicMetadata ?? {}) as Record<string, unknown>;
      return {
        id: readString(invite.id) ?? crypto.randomUUID(),
        token: readString(invite.id) ?? "",
        acceptUrl: readString(invite.url) ?? null,
        email: readString(invite.emailAddress) ?? "",
        role: normalizeMembershipRole(publicMetadata.role ?? invite.role),
        organizationName:
          readString(publicMetadata.organizationName) ??
          readString((invite.publicOrganizationData as Record<string, unknown> | undefined)?.name) ??
          "Organization",
        organizationType: normalizeInviteOrganizationType(publicMetadata.organizationType),
        inviterName: readString(publicMetadata.inviterName) ?? "Anan",
        inviterAuthUserId: readString(publicMetadata.inviterAuthUserId) ?? "",
        canMessage: false,
        conversationId: null,
        expiresAt: Number(invite.expiresAt ?? Date.now()),
      } satisfies IncomingOrganizationInvite;
    });
  },

  async cancelIncomingTeamInvite(token, inviteId) {
    const { userId } = await getClerkContext();
    if (!userId) {
      return legacyOrganizationsRepository.cancelIncomingTeamInvite(token, inviteId);
    }

    const client = await clerkClient();
    const invitationsResult = await client.users.getOrganizationInvitationList({
      userId,
      status: "pending",
      limit: 100,
    });
    const invitation = invitationsResult.data.find((entry) => entry.id === inviteId);
    if (!invitation?.organizationId) {
      return;
    }

    await client.organizations.revokeOrganizationInvitation({
      organizationId: invitation.organizationId,
      invitationId: inviteId,
      requestingUserId: userId,
    });
  },
};

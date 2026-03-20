import { ConvexError } from "convex/values";
import { type MutationCtx } from "../../../_generated/server";
import { appendInboxCollaborationEvent } from "../../inbox";
import { auditLog } from "../../../auditLog";
import { tenants } from "../../../tenants";
import {
  findProfileByAuthUserId,
  findTenantOrgLinkByTenantOrgId,
  getOrganizationRecord,
  normalizeEmail,
  resolveTenantOrgIdForOwner,
  type AgenciesRepositoryCtx,
  type OwnerContext,
} from "./core";

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
function getOrganizationType(owner: OwnerContext) {
  return owner.ownerType === "broker" ? ("broker" as const) : ("developer" as const);
}
export function normalizeTenantRole(role?: string): "manager" | "member" | "viewer" {
  if (role === "owner" || role === "admin" || role === "manager") return "manager";
  if (role === "viewer") return "viewer";
  return "member";
}

async function getOwnerDisplay(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const organization = await getOrganizationRecord(ctx, owner);
  return {
    organizationId: owner.ownerType === "broker" ? String(owner.ownerBrokerId) : String(owner.ownerREDId),
    organizationName: organization?.name ?? "منظمة عنان",
    organizationType: getOrganizationType(owner),
  };
}
export async function listTeamInvitesForOwnerInternal(ctx: AgenciesRepositoryCtx, owner: OwnerContext) {
  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, owner);
  const invitations = await tenants.listInvitations(ctx as never, tenantOrgId);

  return invitations
    .filter((invite) => invite.status === "pending" || invite.status === "accepted" || invite.status === "cancelled")
    .map((invite) => ({
      id: invite._id,
      email: invite.inviteeIdentifier,
      role: normalizeTenantRole(invite.role),
      status: invite.status === "cancelled" ? "canceled" : (invite.status as "pending" | "accepted" | "canceled"),
      token: invite._id,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.status === "accepted" ? invite._creationTime : undefined,
    }));
}
async function ensureNoDuplicateInvite(ctx: MutationCtx, tenantOrgId: string, normalizedEmail: string) {
  const existingInvites = await tenants.listInvitations(ctx as never, tenantOrgId);
  const duplicate = existingInvites.find(
    (invite) => invite.status === "pending" && normalizeEmail(invite.inviteeIdentifier) === normalizedEmail,
  );
  if (duplicate) {
    throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
  }
}
async function findInvitedProfileByEmail(ctx: MutationCtx, normalizedEmail: string) {
  return (await ctx.db.query("userProfiles").collect()).find(
    (profile) => normalizeEmail(profile.email ?? "") === normalizedEmail,
  );
}
async function ensureInviteeIsNotActiveMember(
  ctx: MutationCtx,
  tenantOrgId: string,
  invitedProfile: Awaited<ReturnType<typeof findInvitedProfileByEmail>>,
) {
  if (!invitedProfile?.authUserId) return;
  const existingMember = await tenants.getMember(ctx as never, tenantOrgId, invitedProfile.authUserId);
  if (existingMember && (existingMember.status ?? "active") === "active") {
    throw new ConvexError({ code: "MEMBER_EXISTS", message: "User is already a member of this organization" });
  }
}
function buildInviteEventMetadata(args: {
  inviterProfile: NonNullable<Awaited<ReturnType<typeof findProfileByAuthUserId>>>;
  invitedProfile: NonNullable<Awaited<ReturnType<typeof findInvitedProfileByEmail>>>;
  ownerDisplay: Awaited<ReturnType<typeof getOwnerDisplay>>;
  role: "manager" | "member" | "viewer";
  invitationId: string;
}) {
  return {
    contextType: "invite_event" as const,
    actor: {
      authUserId: args.inviterProfile.authUserId,
      name: args.inviterProfile.name ?? args.inviterProfile.email ?? "عضو الفريق",
      role: args.inviterProfile.role === "RED" ? "developer" : args.inviterProfile.role ?? "user",
      organizationId: args.ownerDisplay.organizationId,
      organizationType: args.ownerDisplay.organizationType,
      organizationName: args.ownerDisplay.organizationName,
    },
    recipient: {
      recipientAuthUserId: args.invitedProfile.authUserId,
      organizationId: args.ownerDisplay.organizationId,
      organizationType: args.ownerDisplay.organizationType,
      organizationName: args.ownerDisplay.organizationName,
    },
    title: args.ownerDisplay.organizationName,
    summary: `دعوة جديدة بدور ${args.role}`,
    href: "/ws/inbox",
    action: {
      type: "open_invite" as const,
      label: "افتح الدعوة",
      href: "/ws/inbox",
    },
    inviteId: args.invitationId,
    inviteRole: args.role,
    inviteStatus: "pending" as const,
    organizationName: args.ownerDisplay.organizationName,
    organizationType: args.ownerDisplay.organizationType,
  };
}

async function maybeSendInviteEvent(args: {
  ctx: MutationCtx;
  inviterProfile: Awaited<ReturnType<typeof findProfileByAuthUserId>>;
  invitedProfile: Awaited<ReturnType<typeof findInvitedProfileByEmail>>;
  ownerDisplay: Awaited<ReturnType<typeof getOwnerDisplay>>;
  role: "manager" | "member" | "viewer";
  invitationId: string;
}) {
  if (
    !args.invitedProfile?.authUserId ||
    !args.inviterProfile?.authUserId ||
    args.invitedProfile.authUserId === args.inviterProfile.authUserId
  ) {
    return;
  }
  await appendInboxCollaborationEvent(args.ctx, {
    senderUserId: args.inviterProfile.authUserId,
    recipientUserId: args.invitedProfile.authUserId,
    type: "invite_event",
    body: `تم إرسال دعوة للانضمام إلى ${args.ownerDisplay.organizationName}`,
    metadata: buildInviteEventMetadata({
      inviterProfile: args.inviterProfile,
      invitedProfile: args.invitedProfile,
      ownerDisplay: args.ownerDisplay,
      role: args.role,
      invitationId: args.invitationId,
    }),
  });
}

async function logInviteCreated(args: {
  ctx: MutationCtx;
  owner: OwnerContext;
  tenantOrgId: string;
  invitationId: string;
  normalizedEmail: string;
  role: "manager" | "member" | "viewer";
}) {
  await auditLog.log(args.ctx, {
    action: "invitation.created",
    actorId: args.owner.authUserId,
    resourceType: "tenantInvitations",
    resourceId: args.invitationId,
    severity: "info",
    metadata: {
      tenantOrgId: args.tenantOrgId,
      inviteeEmail: args.normalizedEmail,
      role: args.role,
      ownerType: args.owner.ownerType,
    },
    tags: ["organizations", "invites"],
  });
}

type CreateTeamInviteArgs = {
  owner: OwnerContext;
  email: string;
  role: "manager" | "member" | "viewer";
};

async function createTenantInvite(ctx: MutationCtx, args: {
  owner: OwnerContext;
  tenantOrgId: string;
  normalizedEmail: string;
  role: "manager" | "member" | "viewer";
}) {
  return tenants.inviteMember(ctx as never, args.owner.authUserId, args.tenantOrgId, args.normalizedEmail, args.role, { expiresAt: Date.now() + INVITE_TTL_MS });
}

export async function createTeamInviteForOwnerRecord(ctx: MutationCtx, args: CreateTeamInviteArgs) {
  const normalizedEmail = normalizeEmail(args.email);
  if (!normalizedEmail) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Email is required" });
  }

  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, args.owner);
  await ensureNoDuplicateInvite(ctx, tenantOrgId, normalizedEmail);
  const invitedProfile = await findInvitedProfileByEmail(ctx, normalizedEmail);
  await ensureInviteeIsNotActiveMember(ctx, tenantOrgId, invitedProfile);
  const inviteResult = await createTenantInvite(ctx, { owner: args.owner, tenantOrgId, normalizedEmail, role: args.role });
  const inviterProfile = await findProfileByAuthUserId(ctx, args.owner.authUserId);
  const ownerDisplay = await getOwnerDisplay(ctx, args.owner);
  await maybeSendInviteEvent({ ctx, inviterProfile, invitedProfile, ownerDisplay, role: args.role, invitationId: inviteResult.invitationId });
  await logInviteCreated({ ctx, owner: args.owner, tenantOrgId, invitationId: inviteResult.invitationId, normalizedEmail, role: args.role });
  return inviteResult.invitationId;
}

export async function acceptInviteForAuthUserRecord(
  ctx: MutationCtx,
  args: { authUserId: string; token: string },
) {
  const invitation = await tenants.getInvitation(ctx as never, args.token);
  await tenants.acceptInvitation(ctx as never, args.token, args.authUserId, {
    acceptingUserIdentifier: args.authUserId,
  });

  await auditLog.log(ctx, {
    action: "invitation.accepted",
    actorId: args.authUserId,
    resourceType: "tenantInvitations",
    resourceId: args.token,
    severity: "info",
    metadata: {
      tenantOrgId: invitation?.organizationId,
      inviteeEmail: invitation?.inviteeIdentifier,
      role: invitation?.role,
    },
    tags: ["organizations", "invites"],
  });
}

type InviteeProfile = {
  authUserId: string;
  email?: string;
};

function toIncomingInvite(item: {
  invite: Awaited<ReturnType<typeof tenants.getPendingInvitations>>[number];
  organizationName: string;
  organizationType: "broker" | "developer";
  inviterName: string;
  inviterAuthUserId: string;
}) {
  return {
    id: item.invite._id,
    token: item.invite._id,
    email: item.invite.inviteeIdentifier,
    role: normalizeTenantRole(item.invite.role),
    organizationName: item.organizationName,
    organizationType: item.organizationType,
    inviterName: item.inviterName,
    inviterAuthUserId: item.inviterAuthUserId,
    canMessage: true,
    conversationId: null,
    expiresAt: item.invite.expiresAt,
  };
}

export async function listIncomingTeamInvitesForProfile(ctx: AgenciesRepositoryCtx, profile: InviteeProfile) {
  const email = profile.email ? normalizeEmail(profile.email) : null;
  if (!email) return [];
  const invitations = await tenants.getPendingInvitations(ctx as never, email);
  const organizations = await Promise.all(
    invitations.map(async (invite) => {
      const link = await findTenantOrgLinkByTenantOrgId(ctx, invite.organizationId);
      const ownerType = link?.ownerType === "broker" ? ("broker" as const) : ("developer" as const);
      const tenantOrg = await tenants.getOrganization(ctx as never, invite.organizationId);
      const organization = link
        ? await getOrganizationRecord(ctx, {
            ownerType: link.ownerType,
            ownerBrokerId: link.ownerBrokerId!,
            ownerREDId: link.ownerREDId!,
            authUserId: profile.authUserId,
            tenantOrgId: link.tenantOrgId,
          })
        : null;
      return {
        invite,
        organizationName: organization?.name ?? tenantOrg?.name ?? "منظمة عنان",
        organizationType: ownerType,
        inviterName: invite.inviterName ?? "عضو الفريق",
        inviterAuthUserId: invite.inviterId ?? "",
      };
    }),
  );
  return organizations.map(toIncomingInvite);
}

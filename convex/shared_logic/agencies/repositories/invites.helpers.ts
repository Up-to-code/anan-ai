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

export async function createTeamInviteForOwnerRecord(
  ctx: MutationCtx,
  args: {
    owner: OwnerContext;
    email: string;
    role: "manager" | "member" | "viewer";
  },
) {
  const normalizedEmail = normalizeEmail(args.email);
  if (!normalizedEmail) {
    throw new ConvexError({ code: "INVALID_ARGUMENT", message: "Email is required" });
  }

  const tenantOrgId = await resolveTenantOrgIdForOwner(ctx, args.owner);
  const existingInvites = await tenants.listInvitations(ctx as never, tenantOrgId);
  const duplicate = existingInvites.find(
    (invite) => invite.status === "pending" && normalizeEmail(invite.inviteeIdentifier) === normalizedEmail,
  );
  if (duplicate) {
    throw new ConvexError({ code: "INVITE_EXISTS", message: "Pending invite already exists for this email" });
  }

  const invitedProfile = (await ctx.db.query("userProfiles").collect()).find(
    (profile) => normalizeEmail(profile.email ?? "") === normalizedEmail,
  );
  if (invitedProfile?.authUserId) {
    const existingMember = await tenants.getMember(ctx as never, tenantOrgId, invitedProfile.authUserId);
    if (existingMember && (existingMember.status ?? "active") === "active") {
      throw new ConvexError({ code: "MEMBER_EXISTS", message: "User is already a member of this organization" });
    }
  }

  const inviteResult = await tenants.inviteMember(
    ctx as never,
    args.owner.authUserId,
    tenantOrgId,
    normalizedEmail,
    args.role,
    {
      expiresAt: Date.now() + INVITE_TTL_MS,
    },
  );

  const inviterProfile = await findProfileByAuthUserId(ctx, args.owner.authUserId);
  const ownerDisplay = await getOwnerDisplay(ctx, args.owner);

  if (invitedProfile?.authUserId && inviterProfile?.authUserId && invitedProfile.authUserId !== inviterProfile.authUserId) {
    await appendInboxCollaborationEvent(ctx, {
      senderUserId: inviterProfile.authUserId,
      recipientUserId: invitedProfile.authUserId,
      type: "invite_event",
      body: `تم إرسال دعوة للانضمام إلى ${ownerDisplay.organizationName}`,
      metadata: {
        contextType: "invite_event",
        actor: {
          authUserId: inviterProfile.authUserId,
          name: inviterProfile.name ?? inviterProfile.email ?? "عضو الفريق",
          role: inviterProfile.role === "RED" ? "developer" : inviterProfile.role ?? "user",
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
          organizationName: ownerDisplay.organizationName,
        },
        recipient: {
          recipientAuthUserId: invitedProfile.authUserId,
          organizationId: ownerDisplay.organizationId,
          organizationType: ownerDisplay.organizationType,
          organizationName: ownerDisplay.organizationName,
        },
        title: ownerDisplay.organizationName,
        summary: `دعوة جديدة بدور ${args.role}`,
        href: "/ws/inbox",
        action: {
          type: "open_invite",
          label: "افتح الدعوة",
          href: "/ws/inbox",
        },
        inviteId: inviteResult.invitationId,
        inviteRole: args.role,
        inviteStatus: "pending",
        organizationName: ownerDisplay.organizationName,
        organizationType: ownerDisplay.organizationType,
      },
    });
  }

  await auditLog.log(ctx, {
    action: "invitation.created",
    actorId: args.owner.authUserId,
    resourceType: "tenantInvitations",
    resourceId: inviteResult.invitationId,
    severity: "info",
    metadata: {
      tenantOrgId,
      inviteeEmail: normalizedEmail,
      role: args.role,
      ownerType: args.owner.ownerType,
    },
    tags: ["organizations", "invites"],
  });

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

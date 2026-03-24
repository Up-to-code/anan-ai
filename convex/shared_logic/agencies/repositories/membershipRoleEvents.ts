import { appendInboxCollaborationEvent } from "../../inbox";
import { findProfileByAuthUserId, getOrganizationRecord, type OwnerContext, type UserProfileRecord } from "./core";

function resolveOrganizationIdentity(owner: OwnerContext) {
  return {
    organizationType: owner.ownerType === "broker" ? ("broker" as const) : ("developer" as const),
    organizationId: owner.ownerType === "broker" ? String(owner.ownerBrokerId) : String(owner.ownerREDId),
  };
}

function buildRoleEventMetadata(args: {
  current: { profile: UserProfileRecord; owner: OwnerContext };
  targetProfile: UserProfileRecord;
  organizationName: string;
  role: "manager" | "member" | "viewer";
}) {
  const { organizationType, organizationId } = resolveOrganizationIdentity(args.current.owner);
  return {
    contextType: "role_event" as const,
    actor: {
      authUserId: args.current.profile.authUserId,
      name: args.current.profile.name ?? args.current.profile.email ?? "عضو الفريق",
      role: args.current.profile.role === "RED" ? "developer" : args.current.profile.role ?? "user",
      organizationId,
      organizationType,
      organizationName: args.organizationName,
    },
    recipient: {
      recipientAuthUserId: args.targetProfile.authUserId,
      organizationId,
      organizationType,
      organizationName: args.organizationName,
    },
    title: args.organizationName,
    summary: `تم تغيير الدور إلى ${args.role}`,
    href: "/ws/inbox",
    action: {
      type: "open_membership" as const,
      label: "افتح العضوية",
      href: "/ws/inbox",
    },
    membershipId: args.targetProfile.authUserId,
    organizationRole: args.role,
    organizationName: args.organizationName,
    organizationType,
  };
}

export async function maybeNotifyMembershipRoleUpdated(args: {
  ctx: any;
  current: { profile: UserProfileRecord; owner: OwnerContext };
  targetAuthUserId: string;
  role: "manager" | "member" | "viewer";
}) {
  if (args.targetAuthUserId === args.current.profile.authUserId) return;
  const [targetProfile, organization] = await Promise.all([
    findProfileByAuthUserId(args.ctx, args.targetAuthUserId),
    getOrganizationRecord(args.ctx, args.current.owner),
  ]);
  if (!targetProfile?.authUserId || !organization?.name) return;
  await appendInboxCollaborationEvent(args.ctx, {
    senderUserId: args.current.profile.authUserId,
    recipientUserId: targetProfile.authUserId,
    type: "role_event",
    body: `تم تحديث دورك في ${organization.name}`,
    metadata: buildRoleEventMetadata({
      current: args.current,
      targetProfile,
      organizationName: organization.name,
      role: args.role,
    }),
  });
}

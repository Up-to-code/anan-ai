import { requireRole } from "../../_core/security/accessPolicy";
import { tenants } from "../../tenants";
import { buildOrganizationKey } from "./helpers";

export const listOrganizationMembershipsArgs = {};

function resolveOwner(link: any, brokers: any[], developers: any[]) {
  const ownerType: "broker" | "red" = link.ownerType === "broker" ? "broker" : "red";
  const ownerId = link.ownerType === "broker" ? link.ownerBrokerId : link.ownerREDId;
  if (!ownerId) {
    return null;
  }
  const ownerRecord = ownerType === "broker"
    ? brokers.find((item: any) => item._id === ownerId)
    : developers.find((item: any) => item._id === ownerId);
  return { ownerType, ownerId, ownerRecord };
}

function buildMembershipRow(args: {
  link: any;
  member: any;
  ownerType: "broker" | "red";
  ownerId: any;
  ownerRecord: any;
  profiles: any[];
}) {
  const profile = args.profiles.find((item: any) => item.authUserId === args.member.userId);
  return {
    id: `${args.link.tenantOrgId}:${args.member.userId}`,
    organizationKey: buildOrganizationKey(args.ownerType, String(args.ownerId)),
    organizationName: args.ownerRecord?.name ?? "منظمة غير معروفة",
    ownerType: args.ownerType,
    authUserId: args.member.userId,
    role: args.member.role,
    status: args.member.status ?? "active",
    createdAt: args.member.joinedAt ?? args.member._creationTime,
    updatedAt: args.member.joinedAt ?? args.member._creationTime,
    profile: profile
      ? {
          id: String(profile._id),
          name: profile.name ?? profile.email ?? "مستخدم عنان",
          email: profile.email ?? null,
          role: profile.role ?? null,
          roleStatus: profile.roleStatus ?? null,
        }
      : null,
  };
}

/**
 * WHY:   Admin needs one joined membership list to audit who belongs to which organization.
 * WHAT:  Returns organization memberships with owner and profile metadata.
 * HOW:   Joins memberships against brokers, RED organizations, and user profiles.
 */
export async function listOrganizationMembershipsHandler(ctx: any) {
  await requireRole(ctx, ["admin"]);

  const [tenantLinks, brokers, developers, profiles] = await Promise.all([
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("userProfiles").collect(),
  ]);

  const rows = await Promise.all(
    tenantLinks.map(async (link: any) => {
      const owner = resolveOwner(link, brokers, developers);
      if (!owner) return [];

      const members = await tenants.listMembers(ctx as never, link.tenantOrgId);
      return members.map((member) => buildMembershipRow({
        link,
        member,
        ownerType: owner.ownerType,
        ownerId: owner.ownerId,
        ownerRecord: owner.ownerRecord,
        profiles,
      }));
    })
  );

  return rows.flat();
}

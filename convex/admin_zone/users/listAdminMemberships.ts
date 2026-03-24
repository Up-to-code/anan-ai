import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../../_core/security/accessPolicy";
import { buildUserKey, paginateRows } from "./helpers";
import { buildTenantMembershipRows } from "./tenantMembership";

export const listAdminMembershipsArgs = {
  paginationOpts: paginationOptsValidator,
};

function resolveMembershipOrganizationName(args: {
  membership: any;
  brokers: any[];
  developers: any[];
}) {
  const { membership, brokers, developers } = args;
  return membership.ownerType === "broker"
    ? brokers.find((item: any) => String(item._id) === membership.ownerId)?.name
    : developers.find((item: any) => String(item._id) === membership.ownerId)?.name;
}

function mapMembershipRow(args: { membership: any; profiles: any[]; brokers: any[]; developers: any[] }) {
  const { membership, profiles, brokers, developers } = args;
  const profile = profiles.find((item: any) => item.authUserId === membership.member.userId);
  const organizationName = resolveMembershipOrganizationName({ membership, brokers, developers });
  return {
    id: `${membership.tenantOrgId}:${membership.member.userId}`,
    organizationName: organizationName ?? "منظمة غير معروفة",
    ownerType: membership.ownerType,
    role: membership.member.role,
    status: membership.member.status ?? "active",
    createdAt: membership.member.joinedAt ?? membership.member._creationTime,
    updatedAt: membership.member.joinedAt ?? membership.member._creationTime,
    profileName: profile?.name ?? profile?.email ?? "مستخدم عنان",
    profileEmail: profile?.email ?? null,
    userKey: profile
      ? buildUserKey({
          authUserId: profile.authUserId,
          externalUserId: null,
          fallbackId: String(profile._id),
        })
      : null,
  };
}

export async function listAdminMembershipsHandler(
  ctx: any,
  { paginationOpts }: { paginationOpts: { cursor: string | null; numItems: number } }
) {
  await requireRole(ctx, ["admin"]);
  const [tenantLinks, profiles, brokers, developers] = await Promise.all([
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
  ]);
  const memberships = await buildTenantMembershipRows(ctx, tenantLinks);
  const rows = memberships
    .map((membership) => mapMembershipRow({ membership, profiles, brokers, developers }))
    .sort((left, right) => right.updatedAt - left.updatedAt);

  return paginateRows(rows, paginationOpts);
}

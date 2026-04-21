import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";
import { requireRole } from "../../_core/security/accessPolicy";
import { buildUserKey, paginateRows, resolveVerificationStatus } from "./helpers";
import { buildTenantMembershipRows } from "./tenantMembership";

/**
 * WHY:   The Arabic admin users section needs a joined all-users list instead of raw channel rows only.
 * WHAT:  Returns admin user rows enriched with profile, organization, and verification metadata.
 * HOW:   Joins `userProfiles`, `users`, tenant memberships, organizations, and verification requests in memory before paginating.
 */
export const listAdminUsersArgs = {
  paginationOpts: paginationOptsValidator,
  role: v.optional(
    v.union(
      v.literal("admin"),
      v.literal("broker"),
      v.literal("developer"),
      v.literal("user")
    )
  ),
};

async function loadAdminUsersData(ctx: any) {
  const [profiles, users, brokers, developers, tenantLinks, verificationRequests] = await Promise.all([
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("users").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("verificationRequests").collect(),
  ]);
  const tenantMemberships = await buildTenantMembershipRows(ctx, tenantLinks);
  return { profiles, users, brokers, developers, verificationRequests, tenantMemberships };
}

function buildMembershipCountByAuthUserId(tenantMemberships: Array<{ member: { userId: string } }>) {
  const membershipCountByAuthUserId = new Map<string, number>();
  for (const row of tenantMemberships) {
    membershipCountByAuthUserId.set(
      row.member.userId,
      (membershipCountByAuthUserId.get(row.member.userId) ?? 0) + 1
    );
  }
  return membershipCountByAuthUserId;
}

function buildProfileRows(args: {
  profiles: any[];
  verificationRequests: any[];
  brokers: any[];
  developers: any[];
  membershipCountByAuthUserId: Map<string, number>;
}) {
  return args.profiles.map((profile: any) => {
    const latestRequest = args.verificationRequests
      .filter((request: any) => request.subjectProfileId === profile._id)
      .sort((left: any, right: any) => right.submittedAt - left.submittedAt)[0];
    const linkedBroker = profile.brokerId
      ? args.brokers.find((item: any) => item._id === profile.brokerId)
      : null;
    const linkedDeveloper = profile.developerId
      ? args.developers.find((item: any) => item._id === profile.developerId)
      : null;
    return {
      userKey: buildUserKey({
        authUserId: profile.authUserId,
        externalUserId: null,
        fallbackId: String(profile._id),
      }),
      authUserId: profile.authUserId,
      externalUserId: null,
      name: profile.name ?? profile.email ?? "مستخدم عنان",
      email: profile.email ?? null,
      channel: null,
      role: profile.role ?? null,
      roleApprovalStatus: profile.roleApprovalStatus ?? null,
      requestedRole: profile.requestedRole ?? null,
      isActive: profile.isActive ?? true,
      organizationName: linkedBroker?.name ?? linkedDeveloper?.name ?? null,
      organizationType: linkedBroker ? "broker" : linkedDeveloper ? "red" : null,
      membershipsCount: args.membershipCountByAuthUserId.get(profile.authUserId) ?? 0,
      verificationStatus: resolveVerificationStatus(latestRequest?.currentStatus, profile.roleApprovalStatus),
    };
  });
}

function buildChannelRows(users: any[], matchedEmails: Set<string>) {
  return users
    .filter((user: any) => !user.email || !matchedEmails.has(user.email))
    .map((user: any) => ({
      userKey: buildUserKey({
        externalUserId: user.userId ?? null,
        authUserId: null,
        fallbackId: String(user._id),
      }),
      authUserId: null,
      externalUserId: user.userId ?? null,
      name: user.displayName ?? user.name ?? user.email ?? "مستخدم قناة",
      email: user.email ?? null,
      channel: user.channel ?? null,
      role: null,
      roleApprovalStatus: null,
      requestedRole: null,
      isActive: true,
      organizationName: null,
      organizationType: null,
      membershipsCount: 0,
      verificationStatus: "none",
    }));
}

export async function listAdminUsersHandler(
  ctx: any,
  { paginationOpts, role }: { paginationOpts: { cursor: string | null; numItems: number }; role?: string | null }
) {
  await requireRole(ctx, ["admin"]);
  const data = await loadAdminUsersData(ctx);
  const membershipCountByAuthUserId = buildMembershipCountByAuthUserId(data.tenantMemberships);
  const profileRows = buildProfileRows({
    profiles: data.profiles,
    verificationRequests: data.verificationRequests,
    brokers: data.brokers,
    developers: data.developers,
    membershipCountByAuthUserId,
  });
  const matchedEmails = new Set(profileRows.map((item: any) => item.email).filter(Boolean));
  const channelRows = buildChannelRows(data.users, matchedEmails);
  const rows = [...profileRows, ...channelRows]
    .filter((item) => !role || item.role === role)
    .sort((left, right) => left.name.localeCompare(right.name, "ar"));

  return paginateRows(rows, paginationOpts);
}

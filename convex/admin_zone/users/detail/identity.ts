import { buildOrganizationProjection, resolveVerificationStatus } from "../helpers";
import type { TenantMembershipRow } from "../tenantMembership";

type ResolveIdentityArgs = {
  userKey: string;
  profiles: any[];
  users: any[];
  brokers: any[];
  developers: any[];
  tenantMemberships: TenantMembershipRow[];
  verificationRequests: any[];
  subscriptions: any[];
};

function resolveProfileAndChannelUser(args: ResolveIdentityArgs) {
  const { userKey, profiles, users } = args;
  if (userKey.startsWith("auth__")) {
    const authUserId = userKey.slice("auth__".length);
    const profile = profiles.find((item) => item.authUserId === authUserId) ?? null;
    const channelUser = profile?.email
      ? users.find((item) => item.email === profile?.email) ?? null
      : null;
    return { profile, channelUser };
  }
  if (userKey.startsWith("channel__")) {
    const externalUserId = userKey.slice("channel__".length);
    const channelUser = users.find((item) => item.userId === externalUserId) ?? null;
    const profile = channelUser?.email
      ? profiles.find((item) => item.email === channelUser?.email) ?? null
      : null;
    return { profile, channelUser };
  }
  if (userKey.startsWith("record__")) {
    const recordId = userKey.slice("record__".length);
    return { profile: null, channelUser: users.find((item) => String(item._id) === recordId) ?? null };
  }
  return { profile: null, channelUser: null };
}

function resolveOrganizations(profile: any, brokers: any[], developers: any[]) {
  return [
    ...(profile?.brokerId
      ? [buildOrganizationProjection({ brokerId: String(profile.brokerId) }, brokers, developers)].filter(Boolean)
      : []),
    ...(profile?.developerId
      ? [buildOrganizationProjection({ redId: String(profile.developerId) }, brokers, developers)].filter(Boolean)
      : []),
  ];
}

function resolveSubscription(profile: any, subscriptions: any[]) {
  const currentBrokerId = profile?.brokerId ? String(profile.brokerId) : null;
  const currentRedId = profile?.developerId ? String(profile.developerId) : null;
  const subscription = currentBrokerId
    ? subscriptions.find((item) => String(item.ownerBrokerId ?? "") === currentBrokerId) ?? null
    : currentRedId
      ? subscriptions.find((item) => String(item.ownerREDId ?? "") === currentRedId) ?? null
      : null;
  return { currentBrokerId, currentRedId, subscription };
}

function resolveVerificationRequests(profile: any, verificationRequests: any[]) {
  const requests = verificationRequests.filter((request) =>
    (profile && request.subjectProfileId === profile._id) ||
    (profile?.brokerId && request.subjectBrokerId === profile.brokerId) ||
    (profile?.developerId && request.subjectREDId === profile.developerId),
  );
  const latest = profile ? requests.sort((left, right) => right.submittedAt - left.submittedAt)[0] : null;
  return { requests, latest };
}

function buildRelevantUserIds(profile: any, channelUser: any) {
  const relevantUserIds = new Set<string>();
  if (profile?.authUserId) relevantUserIds.add(profile.authUserId);
  if (channelUser?.userId) relevantUserIds.add(channelUser.userId);
  return relevantUserIds;
}

function buildIdentityResult(args: {
  profile: any;
  channelUser: any;
  organizations: any[];
  profileMemberships: TenantMembershipRow[];
  userVerificationRequests: any[];
  latestRequest: any;
  currentBrokerId: string | null;
  currentRedId: string | null;
  subscription: any;
}) {
  const verified =
    args.organizations.length > 0
      ? args.organizations.some((item) => item && item.isVerified)
      : args.profile?.roleApprovalStatus !== "rejected";
  const hasActiveSubscription =
    !!args.subscription && (args.subscription.status === "active" || args.subscription.status === "trial");
  const actionModeEnabled =
    verified && hasActiveSubscription && args.subscription?.actionModeEnabled === true;
  return {
    actionModeEnabled,
    channelUser: args.channelUser,
    currentBrokerId: args.currentBrokerId,
    currentRedId: args.currentRedId,
    hasActiveSubscription,
    organizations: args.organizations,
    profile: args.profile,
    profileMemberships: args.profileMemberships,
    relevantUserIds: buildRelevantUserIds(args.profile, args.channelUser),
    subscription: args.subscription,
    userVerificationRequests: args.userVerificationRequests,
    verified,
    verificationStatus: resolveVerificationStatus(args.latestRequest?.currentStatus, args.profile?.roleApprovalStatus),
  };
}

export function resolveAdminUserIdentity(args: {
  userKey: string;
  profiles: any[];
  users: any[];
  brokers: any[];
  developers: any[];
  tenantMemberships: TenantMembershipRow[];
  verificationRequests: any[];
  subscriptions: any[];
}) {
  const { profile, channelUser } = resolveProfileAndChannelUser(args);
  if (!profile && !channelUser) {
    return null;
  }
  const organizations = resolveOrganizations(profile, args.brokers, args.developers);
  const profileMemberships = profile
    ? args.tenantMemberships.filter((item) => item.member.userId === profile.authUserId)
    : [];
  const { requests: userVerificationRequests, latest: latestRequest } = resolveVerificationRequests(
    profile,
    args.verificationRequests,
  );
  const { currentBrokerId, currentRedId, subscription } = resolveSubscription(profile, args.subscriptions);
  return buildIdentityResult({
    profile,
    channelUser,
    organizations,
    profileMemberships,
    userVerificationRequests,
    latestRequest,
    currentBrokerId,
    currentRedId,
    subscription,
  });
}

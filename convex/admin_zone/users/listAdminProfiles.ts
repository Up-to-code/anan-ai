import { paginationOptsValidator } from "convex/server";
import { requireAdminAccess } from "../../_core/security/accessPolicy";
import { buildUserKey, paginateRows, resolveVerificationStatus } from "./helpers";

export const listAdminProfilesArgs = {
  paginationOpts: paginationOptsValidator,
};

function resolveProfileOrganizationName(args: { profile: any; brokers: any[]; developers: any[] }) {
  const { profile, brokers, developers } = args;
  return profile.brokerId
    ? brokers.find((item: any) => item._id === profile.brokerId)?.name
    : profile.developerId
      ? developers.find((item: any) => item._id === profile.developerId)?.name
      : null;
}

function resolveLatestRequest(profile: any, verificationRequests: any[]) {
  return verificationRequests
    .filter((request: any) => request.subjectProfileId === profile._id)
    .sort((left: any, right: any) => right.submittedAt - left.submittedAt)[0];
}

function mapProfileRow(args: { profile: any; brokers: any[]; developers: any[]; verificationRequests: any[] }) {
  const { profile, brokers, developers, verificationRequests } = args;
  const latestRequest = resolveLatestRequest(profile, verificationRequests);
  return {
    id: String(profile._id),
    userKey: buildUserKey({
      authUserId: profile.authUserId,
      externalUserId: null,
      fallbackId: String(profile._id),
    }),
    authUserId: profile.authUserId,
    name: profile.name ?? profile.email ?? "مستخدم عنان",
    email: profile.email ?? null,
    role: profile.role ?? null,
    roleApprovalStatus: profile.roleApprovalStatus ?? null,
    requestedRole: profile.requestedRole ?? null,
    organizationName: resolveProfileOrganizationName({ profile, brokers, developers }),
    verificationStatus: resolveVerificationStatus(latestRequest?.currentStatus, profile.roleApprovalStatus),
    isActive: profile.isActive ?? true,
  };
}

export async function listAdminProfilesHandler(
  ctx: any,
  { paginationOpts }: { paginationOpts: { cursor: string | null; numItems: number } }
) {
  await requireAdminAccess(ctx);
  const [profiles, brokers, developers, verificationRequests] = await Promise.all([
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("verificationRequests").collect(),
  ]);
  const rows = profiles
    .map((profile: any) => mapProfileRow({ profile, brokers, developers, verificationRequests }))
    .sort((left: any, right: any) => left.name.localeCompare(right.name, "ar"));

  return paginateRows(rows, paginationOpts);
}

import { paginationOptsValidator } from "convex/server";
import { requireAdminAccess } from "../../_core/security/accessPolicy";
import { buildUserKey, paginateRows } from "./helpers";

/**
 * WHY:   The verification-state tab needs a user-centric review of profile and verification request state.
 * WHAT:  Returns profile-linked verification rows with latest request metadata.
 * HOW:   Joins `userProfiles` against the newest matching verification request for each profile.
 */
export const listAdminUserVerificationArgs = {
  paginationOpts: paginationOptsValidator,
};

export async function listAdminUserVerificationHandler(
  ctx: any,
  { paginationOpts }: { paginationOpts: { cursor: string | null; numItems: number } }
) {
  await requireAdminAccess(ctx);

  const [profiles, verificationRequests] = await Promise.all([
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("verificationRequests").collect(),
  ]);

  const rows = profiles
    .map((profile: any) => {
      const latestRequest = verificationRequests
        .filter((request: any) => request.subjectProfileId === profile._id)
        .sort((left: any, right: any) => right.submittedAt - left.submittedAt)[0];

      return {
        id: String(profile._id),
        userKey: buildUserKey({
          authUserId: profile.authUserId,
          externalUserId: null,
          fallbackId: String(profile._id),
        }),
        name: profile.name ?? profile.email ?? "مستخدم عنان",
        email: profile.email ?? null,
        role: profile.role ?? null,
        roleApprovalStatus: profile.roleApprovalStatus ?? null,
        latestRequestId: latestRequest ? String(latestRequest._id) : null,
        latestRequestStatus: latestRequest?.currentStatus ?? null,
        latestRequestSubmittedAt: latestRequest?.submittedAt ?? null,
      };
    })
    .sort((left: any, right: any) => left.name.localeCompare(right.name, "ar"));

  return paginateRows(rows, paginationOpts);
}

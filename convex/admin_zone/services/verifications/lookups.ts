import type { QueryCtx } from "../../../_generated/server";
import type {
  VerificationLookups,
  VerificationStatus,
} from "../../../shared_logic/verifications/types";

/**
 * WHY:   Admin verification screens need one lookup path for joined request browsing.
 * WHAT:  Lists verification requests, optionally filtered by status.
 * HOW:   Uses the `currentStatus` index when a status filter is provided, otherwise returns the latest rows.
 */
export async function listVerificationRequestsByStatus(
  ctx: QueryCtx,
  status?: VerificationStatus,
) {
  if (status) {
    return ctx.db
      .query("verificationRequests")
      .withIndex("currentStatus", (query) => query.eq("currentStatus", status))
      .collect();
  }
  return ctx.db.query("verificationRequests").order("desc").take(500);
}

/**
 * WHY:   Verification list/detail screens need related profile, org, and property records for joined display.
 * WHAT:  Loads the admin verification lookup tables in parallel.
 * HOW:   Reads the latest profiles, brokers, developers, and properties in one batched operation.
 */
export async function loadVerificationLookups(
  ctx: QueryCtx,
): Promise<VerificationLookups> {
  const [profiles, brokers, developers, properties] = await Promise.all([
    ctx.db.query("userProfiles").order("desc").take(500),
    ctx.db.query("brokers").order("desc").take(500),
    ctx.db.query("RED").order("desc").take(500),
    ctx.db.query("properties").order("desc").take(500),
  ]);
  return { profiles, brokers, developers, properties };
}

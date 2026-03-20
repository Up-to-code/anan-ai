import type { Doc } from "../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../_generated/server";

type Ctx = QueryCtx | MutationCtx;

/**
 * WHY:   Core security helpers must not depend on shared_logic to avoid circular imports.
 * WHAT:  Low-level profile lookup primitives used by identity resolution and auth flows.
 * HOW:   Exposes index-backed queries for authUserId/email without layering concerns.
 */
export async function getProfileByAuthUserId(
  ctx: Ctx,
  authUserId: string,
): Promise<Doc<"userProfiles"> | null> {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", authUserId))
    .first();
}

export async function getProfileByEmail(
  ctx: Ctx,
  email: string,
): Promise<Doc<"userProfiles"> | null> {
  return ctx.db
    .query("userProfiles")
    .withIndex("email", (q) => q.eq("email", email))
    .first();
}


import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";

export async function getSubjectMapping(ctx: any, userId: Id<"users">, clientId: string) {
  return ctx.db
    .query("oauthSubjectMappings")
    .withIndex("clientId_userId", (q: any) => q.eq("clientId", clientId).eq("userId", userId))
    .first();
}

export async function loadUserBundle(ctx: any, userId: Id<"users">, clientId: string) {
  const [user, profile, subjectMapping] = await Promise.all([
    ctx.db.get(userId),
    ctx.db.query("userProfiles").withIndex("authUserId", (q: any) => q.eq("authUserId", String(userId))).first(),
    getSubjectMapping(ctx, userId, clientId),
  ]);
  if (!user || !subjectMapping) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization subject is not available" });
  }
  return { user, profile, subjectMapping };
}

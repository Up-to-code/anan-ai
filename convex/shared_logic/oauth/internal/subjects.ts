import { ConvexError } from "convex/values";
import type { Id } from "../../../_generated/dataModel";
import type { OwnerContext } from "../../agencies/repositories/core";
import { getOrganizationRecord } from "../../agencies/repositories/core";

export async function getSubjectMapping(ctx: any, userId: Id<"users">, clientId: string) {
  return ctx.db
    .query("oauthSubjectMappings")
    .withIndex("clientId_userId", (q: any) => q.eq("clientId", clientId).eq("userId", userId))
    .first();
}

export async function getOrganizationSubjectMapping(ctx: any, owner: OwnerContext, clientId: string) {
  return owner.ownerType === "broker"
    ? ctx.db
        .query("oauthSubjectMappings")
        .withIndex("ownerBrokerId_clientId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId).eq("clientId", clientId))
        .first()
    : ctx.db
        .query("oauthSubjectMappings")
        .withIndex("ownerREDId_clientId", (q: any) => q.eq("ownerREDId", owner.ownerREDId).eq("clientId", clientId))
        .first();
}

export async function loadOrganizationBundle(ctx: any, owner: OwnerContext, clientId: string) {
  const [organization, subjectMapping] = await Promise.all([
    getOrganizationRecord(ctx, owner),
    getOrganizationSubjectMapping(ctx, owner, clientId),
  ]);
  if (!organization || !subjectMapping) {
    throw new ConvexError({ code: "INVALID_GRANT", message: "Authorization subject is not available" });
  }
  return { organization, subjectMapping };
}

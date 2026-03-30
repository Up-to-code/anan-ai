import { ConvexError } from "convex/values";
import type { Doc, Id } from "../../../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";
import { requireSender } from "../access";
import type { OfferCaseStage } from "./types";

export async function getProfileByAuthUserId(ctx: QueryCtx | MutationCtx, authUserId: string) {
  return ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
    .first();
}

export async function loadPropertySummary(ctx: QueryCtx | MutationCtx, propertyId: Id<"properties">) {
  const property = await ctx.db.get(propertyId);
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return property;
}

export async function insertActivity(
  ctx: MutationCtx,
  args: {
    offerCaseId: Id<"offerCases">;
    kind: Doc<"offerActivities">["kind"];
    actorAuthUserId?: string;
    message?: string;
  },
) {
  await ctx.db.insert("offerActivities", {
    offerCaseId: args.offerCaseId,
    kind: args.kind,
    actorAuthUserId: args.actorAuthUserId,
    message: args.message,
    createdAt: Date.now(),
  });
}

export async function setCaseStage(
  ctx: MutationCtx,
  offerCaseId: Id<"offerCases">,
  stage: OfferCaseStage,
  extra?: Partial<Doc<"offerCases">>,
) {
  await ctx.db.patch(offerCaseId, {
    stage,
    updatedAt: Date.now(),
    lastActivityAt: Date.now(),
    ...(extra ?? {}),
  });
}

export function participantMatchesAccess(
  participant: Doc<"offerCaseParticipants">,
  access: Awaited<ReturnType<typeof requireSender>>,
) {
  return (
    participant.authUserId === access.authUserId ||
    (access.brokerId ? participant.brokerId === access.brokerId : false) ||
    (access.REDId ? participant.REDId === access.REDId : false)
  );
}

export async function listParticipantsForCase(ctx: QueryCtx | MutationCtx, offerCaseId: Id<"offerCases">) {
  return ctx.db
    .query("offerCaseParticipants")
    .withIndex("offerCaseId", (q) => q.eq("offerCaseId", offerCaseId))
    .collect();
}

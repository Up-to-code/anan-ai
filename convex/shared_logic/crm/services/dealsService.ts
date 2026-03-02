import { ConvexError, type GenericId } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../../_generated/server";

const CRM_STAGES = ["new", "contacted", "negotiation", "won", "lost"] as const;
type CrmStage = (typeof CRM_STAGES)[number];

type Profile = {
  authUserId: string;
  brokerId?: GenericId<"brokers">;
  REDId?: GenericId<"RED">;
};

async function getAuthedProfile(ctx: QueryCtx | MutationCtx): Promise<Profile> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Authentication required" });
  }

  const profile = await ctx.db
    .query("userProfiles")
    .withIndex("authUserId", (q) => q.eq("authUserId", identity.subject))
    .first();

  if (!profile) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Profile not found" });
  }
  if (profile.isActive === false) {
    throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
  }

  return {
    authUserId: identity.subject,
    brokerId: profile.brokerId,
    REDId: profile.REDId,
  };
}

function assertDealOwnership(
  deal: { brokerId?: GenericId<"brokers">; REDId?: GenericId<"RED"> } | null,
  profile: Profile,
): void {
  if (!deal) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
  }

  const canAccess =
    (profile.brokerId && deal.brokerId === profile.brokerId) ||
    (profile.REDId && deal.REDId === profile.REDId);

  if (!canAccess) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Cannot access this deal" });
  }
}

export async function listDealsForCurrentProfile(ctx: QueryCtx) {
  const profile = await getAuthedProfile(ctx);

  if (profile.REDId) {
    return await ctx.db
      .query("deals")
      .withIndex("REDId", (q) => q.eq("REDId", profile.REDId!))
      .collect();
  }

  if (profile.brokerId) {
    return await ctx.db
      .query("deals")
      .withIndex("brokerId", (q) => q.eq("brokerId", profile.brokerId!))
      .collect();
  }

  return [];
}

export async function listDealsForBootstrapSafe(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return [];
  try {
    return await listDealsForCurrentProfile(ctx);
  } catch (e) {
    // During bootstrap we prefer empty over throwing to avoid UI deadlocks.
    return [];
  }
}

export async function listDealsByProperty(ctx: QueryCtx, propertyId: GenericId<"properties">) {
  await getAuthedProfile(ctx);
  const deals = await ctx.db
    .query("deals")
    .withIndex("propertyId", (q) => q.eq("propertyId", propertyId))
    .collect();

  return await Promise.all(
    deals.map(async (deal) => {
      const [broker, red] = await Promise.all([
        deal.brokerId ? ctx.db.get(deal.brokerId) : Promise.resolve(null),
        deal.REDId ? ctx.db.get(deal.REDId) : Promise.resolve(null),
      ]);

      return {
        ...deal,
        brokerName: broker?.name ?? null,
        redName: red?.name ?? null,
      };
    }),
  );
}

export async function createDealForCurrentProfile(
  ctx: MutationCtx,
  args: {
    title: string;
    description?: string;
    value?: number;
    stage: CrmStage;
    contactName?: string;
    contactPhone?: string;
    propertyId?: GenericId<"properties">;
  },
) {
  const profile = await getAuthedProfile(ctx);

  return await ctx.db.insert("deals", {
    title: args.title,
    description: args.description,
    value: args.value,
    stage: args.stage,
    contactName: args.contactName,
    contactPhone: args.contactPhone,
    propertyId: args.propertyId,
    REDId: profile.REDId,
    brokerId: profile.brokerId,
    lastUpdatedBy: profile.authUserId,
  });
}

export async function updateDealStageForCurrentProfile(
  ctx: MutationCtx,
  args: { dealId: GenericId<"deals">; stage: CrmStage },
) {
  const profile = await getAuthedProfile(ctx);
  const deal = await ctx.db.get(args.dealId);
  assertDealOwnership(deal, profile);

  await ctx.db.patch(args.dealId, {
    stage: args.stage,
    lastUpdatedBy: profile.authUserId,
  });

  return { ok: true } as const;
}

export async function updateDealNotesForCurrentProfile(
  ctx: MutationCtx,
  args: { dealId: GenericId<"deals">; notes: string },
) {
  const profile = await getAuthedProfile(ctx);
  const deal = await ctx.db.get(args.dealId);
  assertDealOwnership(deal, profile);

  await ctx.db.patch(args.dealId, {
    notes: args.notes,
    lastUpdatedBy: profile.authUserId,
  });

  return { ok: true } as const;
}

export async function addDealDocumentForCurrentProfile(
  ctx: MutationCtx,
  args: { dealId: GenericId<"deals">; storageId: GenericId<"_storage"> },
) {
  const profile = await getAuthedProfile(ctx);
  const deal = await ctx.db.get(args.dealId);
  assertDealOwnership(deal, profile);
  const existing = deal?.documentIds ?? [];
  await ctx.db.patch(args.dealId, {
    documentIds: [...existing, args.storageId],
    lastUpdatedBy: profile.authUserId,
  });

  return { ok: true } as const;
}

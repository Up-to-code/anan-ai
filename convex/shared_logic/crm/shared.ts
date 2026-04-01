import { ConvexError } from "convex/values";
import type { MutationCtx, QueryCtx } from "../../_generated/server";
import type { ClientRecord, DealRecord } from "./types";
import { buildAvatarLabel, mapClient, mapDeal } from "./mappers";

type CrmCtx = QueryCtx | MutationCtx;

export function isActiveDeal(deal: DealRecord) {
  return !deal.archivedAt;
}

export function paginateRows<T>(
  rows: T[],
  paginationOpts: { cursor: string | null; numItems: number },
) {
  const offset = paginationOpts.cursor ? Number(paginationOpts.cursor) : 0;
  const page = rows.slice(offset, offset + paginationOpts.numItems);
  const nextOffset = offset + paginationOpts.numItems;
  return {
    page,
    isDone: nextOffset >= rows.length,
    continueCursor: nextOffset >= rows.length ? null : String(nextOffset),
  };
}

/**
 * WHY:   Deal queries repeatedly need the same related broker/client/property enrichment.
 * WHAT:  Loads the related records for one deal and maps the combined projection.
 * HOW:   Fetches the optional relations in parallel, then delegates result shaping to `mapDeal`.
 */
export async function enrichDeal(ctx: CrmCtx, deal: DealRecord) {
  const [broker, red, client, relatedBroker, property] = await Promise.all([
    deal.brokerId ? ctx.db.get(deal.brokerId) : Promise.resolve(null),
    deal.REDId ? ctx.db.get(deal.REDId) : Promise.resolve(null),
    deal.crmClientId ? ctx.db.get(deal.crmClientId) : Promise.resolve(null),
    deal.relatedBrokerId ? ctx.db.get(deal.relatedBrokerId) : Promise.resolve(null),
    deal.propertyId ? ctx.db.get(deal.propertyId) : Promise.resolve(null),
  ]);

  return mapDeal(deal, {
    brokerName: broker?.name ?? null,
    redName: red?.name ?? null,
    client,
    broker: relatedBroker,
    property,
  });
}

export async function listEnrichedDealsByIndex(
  ctx: CrmCtx,
  args: { index: "brokerId" | "REDId"; field: any },
) {
  const deals = await ctx.db
    .query("deals")
    .withIndex(args.index, (q: any) => q.eq(args.index, args.field))
    .collect();

  const activeDeals = deals
    .filter(isActiveDeal)
    .sort(
      (a: DealRecord, b: DealRecord) =>
        (b.createdAt ?? b._creationTime) - (a.createdAt ?? a._creationTime),
    );

  return Promise.all(activeDeals.map((deal: DealRecord) => enrichDeal(ctx, deal)));
}

export async function listClientsByOwnerIndex(
  ctx: CrmCtx,
  args: { index: "brokerId" | "REDId"; ownerId: any },
) {
  const clients = await ctx.db
    .query("crmClients")
    .withIndex(args.index, (q: any) => q.eq(args.index, args.ownerId))
    .collect();

  return clients.sort((a, b) => b.updatedAt - a.updatedAt).map(mapClient);
}

export async function requireExistingDeal(
  ctx: MutationCtx,
  dealId: DealRecord["_id"],
  options?: { mustBeActive?: boolean },
) {
  const deal = await ctx.db.get(dealId);
  if (!deal || (options?.mustBeActive && !isActiveDeal(deal))) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
  }
  return deal;
}

export async function maybeCreateInlineClient(
  ctx: MutationCtx,
  args: {
    crmClientId?: ClientRecord["_id"];
    relationType: DealRecord["relationType"];
    contactName?: string;
    contactPhone?: string;
    description?: string;
    ownerAuthUserId: string;
    brokerId?: DealRecord["brokerId"];
    REDId?: DealRecord["REDId"];
  },
) {
  if (args.crmClientId) return args.crmClientId;
  if (args.relationType !== "internal_client" || !args.contactName) {
    return args.crmClientId;
  }

  return ctx.db.insert("crmClients", {
    ownerAuthUserId: args.ownerAuthUserId,
    brokerId: args.brokerId,
    REDId: args.REDId,
    name: args.contactName,
    phone: args.contactPhone,
    notes: args.description,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
}

export async function listBrokerSelectorOptionRows(ctx: QueryCtx) {
  const brokers = await ctx.db.query("brokers").collect();
  return brokers
    .filter((broker) => (broker.status ?? "active") !== "pending")
    .sort((a, b) => a.name.localeCompare(b.name, "ar"))
    .map((broker) => ({
      id: String(broker._id),
      name: broker.name,
      description: broker.description,
      phone: broker.phone,
      avatarLabel: buildAvatarLabel(broker.name),
      stateLabel: "حالة الوسيط تُعرض عند الربط",
      isVerified: broker.isVerified === true,
    }));
}

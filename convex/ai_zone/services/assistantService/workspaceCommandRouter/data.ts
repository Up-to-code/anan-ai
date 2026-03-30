import { api } from "../../../../_generated/api";
import type { Id } from "../../../../_generated/dataModel";
import type { ActionCtx } from "../../../../_generated/server";
import type { AssistantOwner } from "../types";
import { normalizeCommandText } from "./parse";
import type {
  ClientSummary,
  DealSummary,
  EnrichedClientSummary,
  OfferSummary,
  PaginatedPage,
  ProjectSummary,
} from "./types";

const MAX_LIMIT = 30;

export function sameCairoDay(timestamp: number, now = Date.now()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(new Date(timestamp)) === formatter.format(new Date(now));
}

function normalizeLooseText(value: string | undefined) {
  return normalizeCommandText(value ?? "").replace(/[^\p{L}\p{N}]+/gu, " ").trim();
}

export async function listWorkspaceDeals(
  ctx: ActionCtx,
  owner: AssistantOwner,
): Promise<DealSummary[]> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listDealsByBrokerId, {
      brokerId: owner.ownerBrokerId,
    })) as DealSummary[];
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listDealsByRedId, {
      REDId: owner.ownerREDId,
    })) as DealSummary[];
  }

  return [];
}

export async function listWorkspaceClients(
  ctx: ActionCtx,
  owner: AssistantOwner,
): Promise<ClientSummary[]> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listClientsByBrokerId, {
      brokerId: owner.ownerBrokerId,
    })) as ClientSummary[];
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    return (await ctx.runQuery(api.shared_logic.crm.repositories.listClientsByRedId, {
      REDId: owner.ownerREDId,
    })) as ClientSummary[];
  }

  return [];
}

function pickMatchedDeal(client: ClientSummary, deals: DealSummary[]) {
  const clientPhone = normalizeLooseText(client.phone);
  const clientName = normalizeLooseText(client.name);

  return deals.find((deal) => {
    const dealPhone = normalizeLooseText(deal.contactPhone);
    const dealName = normalizeLooseText(deal.contactName ?? deal.title);
    if (clientPhone && dealPhone && clientPhone === dealPhone) return true;
    if (clientName && dealName && clientName === dealName) return true;
    return false;
  });
}

export function enrichClientsWithDeals(clients: ClientSummary[], deals: DealSummary[]): EnrichedClientSummary[] {
  return clients.map((client) => ({
    ...client,
    matchedDeal: pickMatchedDeal(client, deals),
  }));
}

export async function listWorkspaceProjects(
  ctx: ActionCtx,
  owner: AssistantOwner,
  limit: number,
): Promise<ProjectSummary[]> {
  const paginationOpts = { cursor: null, numItems: Math.min(limit, MAX_LIMIT) };
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    const result = (await ctx.runQuery(api.broker_zone.properties.listByBrokerId, {
      brokerId: owner.ownerBrokerId,
      paginationOpts,
    })) as PaginatedPage<ProjectSummary>;
    return result.page;
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    const result = (await ctx.runQuery(api.red_zone.properties.listByRedId, {
      REDId: owner.ownerREDId,
      paginationOpts,
    })) as PaginatedPage<ProjectSummary>;
    return result.page;
  }

  return [];
}

export async function getWorkspaceProjectById(
  ctx: ActionCtx,
  owner: AssistantOwner,
  projectId: string,
): Promise<ProjectSummary | null> {
  if (owner.ownerType === "broker" && owner.ownerBrokerId) {
    const project = (await ctx.runQuery(api.broker_zone.properties.getById, {
      id: projectId as Id<"properties">,
    })) as ProjectSummary | null;
    if (!project || project.brokerId !== String(owner.ownerBrokerId)) return null;
    return project;
  }

  if (owner.ownerType === "RED" && owner.ownerREDId) {
    const project = (await ctx.runQuery(api.red_zone.properties.getById, {
      id: projectId as Id<"properties">,
    })) as ProjectSummary | null;
    if (!project || project.REDId !== String(owner.ownerREDId)) return null;
    return project;
  }

  return null;
}

export async function deleteWorkspaceProject(
  ctx: ActionCtx,
  owner: AssistantOwner,
  projectId: string,
) {
  const project = await getWorkspaceProjectById(ctx, owner, projectId);
  if (!project) {
    throw new Error("PROJECT_NOT_FOUND_OR_UNAUTHORIZED");
  }

  if (owner.ownerType === "broker") {
    await ctx.runMutation(api.broker_zone.properties.remove, {
      id: projectId as Id<"properties">,
    });
    return;
  }

  if (owner.ownerType === "RED") {
    await ctx.runMutation(api.red_zone.properties.remove, {
      id: projectId as Id<"properties">,
    });
    return;
  }

  throw new Error("PROJECT_DELETE_UNAVAILABLE");
}

export async function listWorkspaceOffers(ctx: ActionCtx): Promise<{
  sent: OfferSummary[];
  received: OfferSummary[];
  marketplace: OfferSummary[];
}> {
  const [sent, received, marketplace] = await Promise.all([
    ctx.runQuery(api.shared_logic.offers.listSentOffers, {}),
    ctx.runQuery(api.shared_logic.offers.listReceivedOffers, {}),
    ctx.runQuery(api.shared_logic.offers.listPublicOffers, {}),
  ]);
  const mapOffer = (offer: any): OfferSummary => ({
    id: String(offer.id ?? offer._id),
    price: offer.price,
    status: offer.status,
    publicationState: offer.publicationState,
    visibility: offer.visibility,
    property: offer.property
      ? {
          title: offer.property.title,
          address: offer.property.address,
        }
      : null,
    description: offer.description,
    message: offer.message,
  });

  return {
    sent: (sent as any[]).map(mapOffer),
    received: (received as any[]).map(mapOffer),
    marketplace: (marketplace as any[]).map(mapOffer),
  };
}

export function filterBySearchTerm<T>(
  items: T[],
  searchTerm: string | undefined,
  projector: (item: T) => string,
) {
  if (!searchTerm) return items;
  const normalizedTerm = normalizeCommandText(searchTerm);
  return items.filter((item) =>
    normalizeCommandText(projector(item)).includes(normalizedTerm),
  );
}

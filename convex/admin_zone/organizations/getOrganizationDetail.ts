import { v } from "convex/values";
import { requireAdminAccess } from "../../_core/security/accessPolicy";
import { parseOrganizationKey } from "./helpers";
import { buildOrganizationConversationSummaries } from "./detail/conversations";
import { buildOrganizationOffers } from "./detail/offers";
import {
  buildOrganizationDetailResponse,
  loadOrganizationCollections,
  loadOrganizationTeam,
  resolveOrganizationContext,
} from "./getOrganizationDetail.helpers";

export const getOrganizationDetailArgs = { organizationKey: v.string() };

/**
 * WHY:   Organization detail tabs need one joined record for the selected broker or developer organization.
 * WHAT:  Returns the organization summary plus members, invites, properties, offers, messages, access state, and verification history.
 * HOW:   Parses the route key, loads the correct owner document, and joins related team, collaboration, and operational tables in memory.
 */
export async function getOrganizationDetailHandler(ctx: any, { organizationKey }: { organizationKey: string }) {
  await requireAdminAccess(ctx);
  const parsed = parseOrganizationKey(organizationKey);
  const collections = await loadOrganizationCollections(ctx);
  const context = resolveOrganizationContext(parsed, collections);
  if (!context) return null;
  const { memberships, invites } = await loadOrganizationTeam(ctx, context.scoped.tenantLink);
  const { counterpartStats, organizationOffers } = buildOrganizationOffers({
    isBroker: context.isBroker,
    parsedId: parsed.id,
    offers: collections.offers,
    brokers: collections.brokers,
    developers: collections.developers,
    properties: collections.properties,
    organizationInboxMessages: context.scoped.organizationInboxMessages,
    organizationDeals: context.scoped.organizationDeals,
    organizationOrders: context.scoped.organizationOrders,
  });
  const conversationSummaries = buildOrganizationConversationSummaries({
    participantRows: context.scoped.participantRows,
    organizationConversations: context.scoped.organizationConversations,
    organizationInboxMessages: context.scoped.organizationInboxMessages,
    profiles: collections.profiles,
  });
  return buildOrganizationDetailResponse({ parsed, organizationKey, organization: context.organization, collections, scoped: context.scoped, memberships, invites, organizationOffers, counterpartStats, conversationSummaries, hasActiveSubscription: context.hasActiveSubscription, actionModeEnabled: context.actionModeEnabled });
}

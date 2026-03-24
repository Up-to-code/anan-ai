import { tenants } from "../../tenants";
import { buildOrganizationDetailResponse } from "./getOrganizationDetail.response";
import type {
  DetailCollections,
  ParsedOrganization,
  ScopedOrganizationData,
} from "./getOrganizationDetail.types";

function resolveOrganization(parsed: ParsedOrganization, collections: DetailCollections) {
  if (parsed.ownerType === "broker") {
    return collections.brokers.find((item) => String(item._id) === parsed.id) ?? null;
  }
  return collections.developers.find((item) => String(item._id) === parsed.id) ?? null;
}

function resolveTenantLink(parsed: ParsedOrganization, tenantOrgLinks: any[]) {
  if (parsed.ownerType === "broker") {
    return tenantOrgLinks.find((link) => String(link.ownerBrokerId) === parsed.id) ?? null;
  }
  return tenantOrgLinks.find((link) => String(link.ownerREDId) === parsed.id) ?? null;
}

function filterByOrganizationOwner(parsed: ParsedOrganization, items: any[], brokerField: string, redField: string) {
  if (parsed.ownerType === "broker") {
    return items.filter((item) => String(item[brokerField] ?? "") === parsed.id);
  }
  return items.filter((item) => String(item[redField] ?? "") === parsed.id);
}

function buildScopedOrganizationData(parsed: ParsedOrganization, collections: DetailCollections): ScopedOrganizationData {
  const linkedProfiles = filterByOrganizationOwner(parsed, collections.profiles, "brokerId", "REDId");
  const authUserIds = new Set(linkedProfiles.map((item) => item.authUserId));
  const participantRows = collections.conversationParticipants.filter((item) => authUserIds.has(item.userId));
  const conversationIds = new Set(participantRows.map((item) => String(item.conversationId)));

  return {
    tenantLink: resolveTenantLink(parsed, collections.tenantOrgLinks),
    organizationProperties: filterByOrganizationOwner(parsed, collections.properties, "brokerId", "REDId"),
    linkedProfiles,
    organizationVerifications: filterByOrganizationOwner(
      parsed,
      collections.verificationRequests,
      "subjectBrokerId",
      "subjectREDId",
    ),
    organizationSubscription:
      filterByOrganizationOwner(parsed, collections.subscriptions, "ownerBrokerId", "ownerREDId")[0] ?? null,
    participantRows,
    organizationConversations: collections.conversations.filter((item) => conversationIds.has(String(item._id))),
    organizationInboxMessages: collections.inboxMessages.filter((item) => conversationIds.has(String(item.conversationId))),
    organizationNotifications: collections.notifications.filter((item) => authUserIds.has(item.userId)),
    organizationOrders:
      parsed.ownerType === "broker"
        ? []
        : collections.orders.filter(
            (item) => String(item.REDId ?? "") === parsed.id || authUserIds.has(item.userId),
          ),
    organizationDeals: filterByOrganizationOwner(parsed, collections.deals, "brokerId", "REDId"),
    authUserIds,
  };
}

async function queryOrganizationCollections(ctx: any) {
  return Promise.all([
    ctx.db.query("brokers").collect(),
    ctx.db.query("RED").collect(),
    ctx.db.query("tenantOrgLinks").collect(),
    ctx.db.query("properties").collect(),
    ctx.db.query("userProfiles").collect(),
    ctx.db.query("verificationRequests").collect(),
    ctx.db.query("subscriptions").collect(),
    ctx.db.query("offers").collect(),
    ctx.db.query("inboxConversationParticipants").collect(),
    ctx.db.query("inboxConversations").collect(),
    ctx.db.query("inboxMessages").collect(),
    ctx.db.query("workspaceNotifications").collect(),
    ctx.db.query("orders").collect(),
    ctx.db.query("deals").collect(),
  ]);
}

function toDetailCollections([
  brokers,
  developers,
  tenantOrgLinks,
  properties,
  profiles,
  verificationRequests,
  subscriptions,
  offers,
  conversationParticipants,
  conversations,
  inboxMessages,
  notifications,
  orders,
  deals,
]: any[]): DetailCollections {
  return {
    brokers,
    developers,
    tenantOrgLinks,
    properties,
    profiles,
    verificationRequests,
    subscriptions,
    offers,
    conversationParticipants,
    conversations,
    inboxMessages,
    notifications,
    orders,
    deals,
  };
}

export async function loadOrganizationCollections(ctx: any): Promise<DetailCollections> {
  return toDetailCollections(await queryOrganizationCollections(ctx));
}

export async function loadOrganizationTeam(ctx: any, tenantLink: any | null) {
  if (!tenantLink) {
    return { memberships: [], invites: [] };
  }
  const [memberships, invites] = await Promise.all([
    tenants.listMembers(ctx as never, tenantLink.tenantOrgId),
    tenants.listInvitations(ctx as never, tenantLink.tenantOrgId),
  ]);
  return { memberships, invites };
}

export function resolveOrganizationContext(parsed: ParsedOrganization, collections: DetailCollections) {
  const organization = resolveOrganization(parsed, collections);
  if (!organization) {
    return null;
  }
  const scoped = buildScopedOrganizationData(parsed, collections);
  const hasActiveSubscription =
    !!scoped.organizationSubscription &&
    (scoped.organizationSubscription.status === "active" || scoped.organizationSubscription.status === "trial");
  const actionModeEnabled =
    organization.isVerified === true &&
    hasActiveSubscription &&
    scoped.organizationSubscription?.actionModeEnabled === true;

  return {
    organization,
    scoped,
    hasActiveSubscription,
    actionModeEnabled,
    isBroker: parsed.ownerType === "broker",
  };
}

export { buildOrganizationDetailResponse };

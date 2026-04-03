import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { auditLog } from "../../../auditLog";
import { findProfileByAuthUserId, type OwnerContext } from "./core";
import { requireApiKeyAccess } from "./membership";
import { normalizeBaseUrl } from "../../../_core/security/authRedirects";
import {
  applyOrganizationProjectSummaryDelta,
  buildPropertyProjectionFields,
} from "../../properties/projections";
import {
  ORGANIZATION_API_KEY_ACTIONS,
  ORGANIZATION_API_KEY_RESOURCES,
  isOrganizationApiKeyPermissionAllowed,
  type OrganizationApiKeyAction,
  type OrganizationApiKeyPermission,
  type OrganizationApiKeyResource,
} from "../../../../shared/auth/organizationPermissions";

const [firstApiKeyResource, ...restApiKeyResources] = ORGANIZATION_API_KEY_RESOURCES;
const [firstApiKeyAction, ...restApiKeyActions] = ORGANIZATION_API_KEY_ACTIONS;

const apiKeyPermissionValidator = v.object({
  resource: v.union(v.literal(firstApiKeyResource), ...restApiKeyResources.map((resource) => v.literal(resource))),
  action: v.union(v.literal(firstApiKeyAction), ...restApiKeyActions.map((action) => v.literal(action))),
});

function permissionKey(permission: OrganizationApiKeyPermission) {
  return `${permission.resource}:${permission.action}`;
}

function machineActorId(apiKey: any) {
  return `api_key:${apiKey.keyId}`;
}

function normalizeTrustedOrigins(origins: string[] | undefined) {
  return Array.from(
    new Set(
      (origins ?? [])
        .map((origin) => normalizeBaseUrl(origin))
        .filter((origin): origin is string => Boolean(origin)),
    ),
  ).sort();
}

function normalizePermissions(permissions: OrganizationApiKeyPermission[]): OrganizationApiKeyPermission[] {
  const normalized = [
    ...new Map(permissions.map((permission) => [permissionKey(permission), permission])).values(),
  ].sort((left, right) => {
    if (left.resource === right.resource) {
      return left.action.localeCompare(right.action);
    }
    return left.resource.localeCompare(right.resource);
  });

  for (const permission of normalized) {
    if (!isOrganizationApiKeyPermissionAllowed(permission)) {
      throw new ConvexError({
        code: "INVALID_ARGUMENT",
        message: `Unsupported API key permission: ${permission.resource}:${permission.action}`,
      });
    }
  }

  return normalized;
}

async function mapApiKeySummary(ctx: any, apiKey: any) {
  const creatorProfile = await findProfileByAuthUserId(ctx, apiKey.createdBy);
  return {
    id: String(apiKey._id),
    keyId: apiKey.keyId,
    prefix: apiKey.prefix,
    name: apiKey.name,
    permissions: apiKey.permissions,
    status: apiKey.revokedAt ? "revoked" : apiKey.status,
    createdBy: apiKey.createdBy,
    createdByName: creatorProfile?.name ?? creatorProfile?.email ?? apiKey.createdBy,
    createdAt: apiKey.createdAt,
    revokedAt: apiKey.revokedAt,
    lastUsedAt: apiKey.lastUsedAt,
    expiresAt: apiKey.expiresAt,
    quotaWindowMinutes: apiKey.quotaWindowMinutes,
    quotaLimit: apiKey.quotaLimit,
    quotaUsed: apiKey.quotaUsed,
    quotaWindowStartedAt: apiKey.quotaWindowStartedAt,
    trustedOrigins: apiKey.trustedOrigins ?? [],
    lastOrigin: apiKey.lastOrigin,
  } as const;
}

function ownerMatchesApiKey(owner: OwnerContext, apiKey: any) {
  if (owner.ownerType === "broker") {
    return apiKey.ownerType === "broker" && apiKey.ownerBrokerId === owner.ownerBrokerId;
  }
  return apiKey.ownerType === "RED" && apiKey.ownerREDId === owner.ownerREDId;
}

function ownerMatchesClient(owner: OwnerContext, client: any) {
  return owner.ownerType === "broker"
    ? client.brokerId === owner.ownerBrokerId
    : client.REDId === owner.ownerREDId;
}

function ownerMatchesProperty(owner: OwnerContext, property: any) {
  return owner.ownerType === "broker"
    ? property.brokerId === owner.ownerBrokerId
    : property.REDId === owner.ownerREDId;
}

function ownerMatchesDeal(owner: OwnerContext, deal: any) {
  return owner.ownerType === "broker"
    ? deal.brokerId === owner.ownerBrokerId
    : deal.REDId === owner.ownerREDId;
}

async function getCurrentOrganizationApiKeyOrThrow(ctx: any, keyId: string, owner: OwnerContext) {
  const apiKey = await ctx.db
    .query("organizationApiKeys")
    .withIndex("keyId", (q: any) => q.eq("keyId", keyId))
    .unique();
  if (!apiKey || !ownerMatchesApiKey(owner, apiKey)) {
    throw new ConvexError({ code: "NOT_FOUND", message: "API key not found" });
  }
  return apiKey;
}

async function getApiKeyBySecretHashOrThrow(ctx: any, secretHash: string) {
  const apiKey = await ctx.db
    .query("organizationApiKeys")
    .withIndex("secretHash", (q: any) => q.eq("secretHash", secretHash))
    .unique();
  const now = Date.now();
  if (
    !apiKey ||
    apiKey.status !== "active" ||
    apiKey.revokedAt ||
    (apiKey.expiresAt && apiKey.expiresAt <= now)
  ) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid API key" });
  }
  return apiKey;
}

function requireApiKeyPermission(apiKey: any, resource: OrganizationApiKeyResource, action: OrganizationApiKeyAction) {
  const granted = new Set((apiKey.permissions ?? []).map((permission: any) => permissionKey(permission)));
  if (!granted.has(permissionKey({ resource, action }))) {
    throw new ConvexError({ code: "FORBIDDEN", message: `Missing API key permission: ${resource}:${action}` });
  }
}

function buildOwnerFromApiKey(apiKey: any): OwnerContext {
  if (apiKey.ownerType === "broker") {
    if (!apiKey.ownerBrokerId) {
      throw new ConvexError({ code: "FORBIDDEN", message: "Broker owner required" });
    }
    return {
      ownerType: "broker",
      ownerBrokerId: apiKey.ownerBrokerId,
      authUserId: apiKey.createdBy,
      tenantOrgId: apiKey.tenantOrgId,
    };
  }
  if (!apiKey.ownerREDId) {
    throw new ConvexError({ code: "FORBIDDEN", message: "Developer owner required" });
  }
  return {
    ownerType: "RED",
    ownerREDId: apiKey.ownerREDId,
    authUserId: apiKey.createdBy,
    tenantOrgId: apiKey.tenantOrgId,
  };
}

async function touchApiKey(ctx: any, apiKeyId: any, now: number) {
  await ctx.db.patch(apiKeyId, { lastUsedAt: now });
}

async function getOrganizationIntegrationPolicy(ctx: any, tenantOrgId: string | undefined) {
  if (!tenantOrgId) return null;
  return ctx.db
    .query("organizationIntegrationPolicies")
    .withIndex("tenantOrgId", (q: any) => q.eq("tenantOrgId", tenantOrgId))
    .unique();
}

function getUsageDateKey(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

async function upsertApiKeyUsageDaily(args: {
  ctx: any;
  apiKey: any;
  now: number;
  denied?: boolean;
}) {
  if (!args.apiKey.tenantOrgId) return;
  const dateKey = getUsageDateKey(args.now);
  const existing = await args.ctx.db
    .query("organizationApiKeyUsageDaily")
    .withIndex("apiKeyId_dateKey", (q: any) => q.eq("apiKeyId", args.apiKey.keyId).eq("dateKey", dateKey))
    .unique();
  if (existing) {
    await args.ctx.db.patch(existing._id, {
      requestCount: existing.requestCount + (args.denied ? 0 : 1),
      deniedCount: existing.deniedCount + (args.denied ? 1 : 0),
      lastUsedAt: args.denied ? existing.lastUsedAt : args.now,
      lastDeniedAt: args.denied ? args.now : existing.lastDeniedAt,
      updatedAt: args.now,
    });
    return;
  }
  await args.ctx.db.insert("organizationApiKeyUsageDaily", {
    tenantOrgId: args.apiKey.tenantOrgId,
    apiKeyId: args.apiKey.keyId,
    dateKey,
    requestCount: args.denied ? 0 : 1,
    deniedCount: args.denied ? 1 : 0,
    lastUsedAt: args.denied ? undefined : args.now,
    lastDeniedAt: args.denied ? args.now : undefined,
    updatedAt: args.now,
  });
}

async function denyApiKeyRequest(args: {
  ctx: any;
  apiKey: any;
  now: number;
  reason: string;
  origin?: string;
}) {
  await args.ctx.db.patch(args.apiKey._id, {
    lastDeniedAt: args.now,
    lastDeniedReason: args.reason,
    lastOrigin: args.origin,
    anomalyFlags: Array.from(new Set([...(args.apiKey.anomalyFlags ?? []), args.reason])),
  });
  await upsertApiKeyUsageDaily({
    ctx: args.ctx,
    apiKey: args.apiKey,
    now: args.now,
    denied: true,
  });
  await auditLog.log(args.ctx, {
    action: "organization.api_key.denied",
    actorId: machineActorId(args.apiKey),
    resourceType: "organizationApiKeys",
    resourceId: String(args.apiKey._id),
    severity: "warning",
    tags: ["organizations", "api-keys", "machine-api"],
    metadata: {
      apiKeyId: args.apiKey.keyId,
      reason: args.reason,
      origin: args.origin ?? null,
    },
  });
}

async function enforceApiKeyRequestPolicy(args: {
  ctx: any;
  apiKey: any;
  now: number;
  origin?: string;
}) {
  const normalizedOrigin = normalizeBaseUrl(args.origin);
  const integrationPolicy = await getOrganizationIntegrationPolicy(args.ctx, args.apiKey.tenantOrgId);
  if (integrationPolicy?.policyStatus === "restricted") {
    await denyApiKeyRequest({
      ctx: args.ctx,
      apiKey: args.apiKey,
      now: args.now,
      reason: "policy_restricted",
      origin: normalizedOrigin ?? undefined,
    });
    throw new ConvexError({ code: "FORBIDDEN", message: "Organization integration policy is restricted" });
  }

  const trustedOrigins = normalizeTrustedOrigins([
    ...(integrationPolicy?.trustedOrigins ?? []),
    ...(args.apiKey.trustedOrigins ?? []),
  ]);
  if (normalizedOrigin && trustedOrigins.length > 0 && !trustedOrigins.includes(normalizedOrigin)) {
    await denyApiKeyRequest({
      ctx: args.ctx,
      apiKey: args.apiKey,
      now: args.now,
      reason: "origin_not_allowed",
      origin: normalizedOrigin,
    });
    throw new ConvexError({ code: "FORBIDDEN", message: "API key origin is not allowed" });
  }

  const windowMinutes = args.apiKey.quotaWindowMinutes ?? 60;
  const windowMs = windowMinutes * 60 * 1000;
  const windowStartedAt = args.apiKey.quotaWindowStartedAt ?? args.now;
  const inWindow = args.now - windowStartedAt < windowMs;
  const nextQuotaUsed = (inWindow ? (args.apiKey.quotaUsed ?? 0) : 0) + 1;
  const quotaLimit = args.apiKey.quotaLimit ?? 1000;

  if (nextQuotaUsed > quotaLimit) {
    await denyApiKeyRequest({
      ctx: args.ctx,
      apiKey: args.apiKey,
      now: args.now,
      reason: "quota_exceeded",
      origin: normalizedOrigin ?? undefined,
    });
    throw new ConvexError({ code: "RATE_LIMITED", message: "API key quota exceeded" });
  }

  await args.ctx.db.patch(args.apiKey._id, {
    quotaWindowMinutes: windowMinutes,
    quotaLimit,
    quotaUsed: nextQuotaUsed,
    quotaWindowStartedAt: inWindow ? windowStartedAt : args.now,
    lastOrigin: normalizedOrigin ?? args.apiKey.lastOrigin,
  });
  await touchApiKey(args.ctx, args.apiKey._id, args.now);
  await upsertApiKeyUsageDaily({
    ctx: args.ctx,
    apiKey: args.apiKey,
    now: args.now,
  });
}

async function authorizeMachineRequest(args: {
  ctx: any;
  secretHash: string;
  now: number;
  resource: OrganizationApiKeyResource;
  action: OrganizationApiKeyAction;
  origin?: string;
}) {
  const apiKey = await getApiKeyBySecretHashOrThrow(args.ctx, args.secretHash);
  await enforceApiKeyRequestPolicy({
    ctx: args.ctx,
    apiKey,
    now: args.now,
    origin: args.origin,
  });
  requireApiKeyPermission(apiKey, args.resource, args.action);
  return apiKey;
}

async function logMachineMutation(args: {
  ctx: any;
  apiKey: any;
  action: string;
  resourceType: string;
  resourceId: string;
  metadata?: Record<string, unknown>;
}) {
  await auditLog.log(args.ctx, {
    action: args.action,
    actorId: machineActorId(args.apiKey),
    resourceType: args.resourceType,
    resourceId: args.resourceId,
    severity: "info",
    tags: ["organizations", "api-keys", "machine-api"],
    metadata: {
      apiKeyId: args.apiKey.keyId,
      createdBy: args.apiKey.createdBy,
      ownerType: args.apiKey.ownerType,
      ...args.metadata,
    },
  });
}

function mapClientRecord(client: any) {
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
    sourceSystem: client.sourceSystem,
    externalId: client.externalId,
    businessId: client.businessId,
    sourceClientId: client.sourceClientId,
    brokerId: client.brokerId ? String(client.brokerId) : undefined,
    redId: client.REDId ? String(client.REDId) : undefined,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
  } as const;
}

function mapPropertyRecord(property: any) {
  return {
    id: String(property._id),
    title: property.title,
    address: property.address,
    price: property.price,
    beds: property.beds,
    baths: property.baths,
    description: property.description,
    area: property.area,
    location: property.location,
    sourceSystem: property.sourceSystem,
    externalId: property.externalId,
    businessId: property.businessId,
    brokerId: property.brokerId ? String(property.brokerId) : undefined,
    redId: property.REDId ? String(property.REDId) : undefined,
    status: property.status,
    publicationState: property.publicationState,
  } as const;
}

function mapBrokerRecord(broker: any) {
  return {
    id: String(broker._id),
    name: broker.name,
    description: broker.description,
    phone: broker.phone,
    isVerified: broker.isVerified === true,
    status: broker.status,
  } as const;
}

function mapDealRelationClient(client: any) {
  return client
    ? {
        id: String(client._id),
        name: client.name,
        phone: client.phone,
        email: client.email,
        sourceSystem: client.sourceSystem,
        externalId: client.externalId,
        businessId: client.businessId,
        sourceClientId: client.sourceClientId,
      }
    : null;
}

function mapDealRelationProject(property: any) {
  return property
    ? {
        id: String(property._id),
        title: property.title,
        address: property.address,
        location: property.location,
        price: property.price,
        publicationState: property.publicationState,
        status: property.status,
        sourceSystem: property.sourceSystem,
        externalId: property.externalId,
        businessId: property.businessId,
      }
    : null;
}

function mapDealRelationBroker(broker: any) {
  return broker
    ? {
        id: String(broker._id),
        name: broker.name,
        description: broker.description,
        phone: broker.phone,
        isVerified: broker.isVerified === true,
        status: broker.status,
      }
    : null;
}

async function mapDealRecord(ctx: any, deal: any) {
  const [client, property, broker] = await Promise.all([
    deal.crmClientId ? ctx.db.get(deal.crmClientId) : Promise.resolve(null),
    deal.propertyId ? ctx.db.get(deal.propertyId) : Promise.resolve(null),
    deal.relatedBrokerId ? ctx.db.get(deal.relatedBrokerId) : Promise.resolve(null),
  ]);

  return {
    id: String(deal._id),
    title: deal.title,
    description: deal.description,
    value: deal.value,
    nextFollowUpAt: deal.nextFollowUpAt,
    stage: deal.stage,
    relationType: deal.relationType,
    notes: deal.notes,
    contactName: deal.contactName,
    contactPhone: deal.contactPhone,
    sourceSystem: deal.sourceSystem,
    externalId: deal.externalId,
    businessId: deal.businessId,
    brokerId: deal.brokerId ? String(deal.brokerId) : undefined,
    redId: deal.REDId ? String(deal.REDId) : undefined,
    clientId: deal.crmClientId ? String(deal.crmClientId) : undefined,
    projectId: deal.propertyId ? String(deal.propertyId) : undefined,
    relatedBrokerId: deal.relatedBrokerId ? String(deal.relatedBrokerId) : undefined,
    createdAt: deal.createdAt ?? deal._creationTime,
    client: mapDealRelationClient(client),
    project: mapDealRelationProject(property),
    broker: mapDealRelationBroker(broker),
  } as const;
}

async function listClientsForOwner(ctx: any, owner: OwnerContext) {
  if (owner.tenantOrgId) {
    const clients = await ctx.db
      .query("crmClients")
      .withIndex("tenantOrgId_updatedAt", (q: any) => q.eq("tenantOrgId", owner.tenantOrgId))
      .order("desc")
      .collect();
    return clients.map(mapClientRecord);
  }
  if (owner.ownerType === "broker") {
    const clients = await ctx.db
      .query("crmClients")
      .withIndex("brokerId", (q: any) => q.eq("brokerId", owner.ownerBrokerId))
      .collect();
    return clients.sort((left: any, right: any) => right.updatedAt - left.updatedAt).map(mapClientRecord);
  }
  const clients = await ctx.db
    .query("crmClients")
    .withIndex("REDId", (q: any) => q.eq("REDId", owner.ownerREDId))
    .collect();
  return clients.sort((left: any, right: any) => right.updatedAt - left.updatedAt).map(mapClientRecord);
}

async function getOwnedClientOrThrow(ctx: any, owner: OwnerContext, clientId: any) {
  const client = await ctx.db.get(clientId);
  if (!client || !ownerMatchesClient(owner, client)) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
  }
  return client;
}

function buildPropertySearchText(property: {
  title?: string;
  address?: string;
  area?: string;
  location?: string;
  description?: string;
}) {
  return [property.title, property.address, property.area, property.location, property.description]
    .filter(Boolean)
    .join(" ");
}

async function listPropertiesForOwner(ctx: any, owner: OwnerContext) {
  if (owner.tenantOrgId) {
    const properties = await ctx.db
      .query("properties")
      .withIndex("tenantOrgId_updatedAt", (q: any) => q.eq("tenantOrgId", owner.tenantOrgId))
      .order("desc")
      .collect();
    return properties.map(mapPropertyRecord);
  }
  if (owner.ownerType === "broker") {
    const properties = await ctx.db
      .query("properties")
      .withIndex("brokerId", (q: any) => q.eq("brokerId", owner.ownerBrokerId))
      .collect();
    return properties.map(mapPropertyRecord);
  }
  const properties = await ctx.db
    .query("properties")
    .withIndex("REDId", (q: any) => q.eq("REDId", owner.ownerREDId))
    .collect();
  return properties.map(mapPropertyRecord);
}

async function getOwnedPropertyOrThrow(ctx: any, owner: OwnerContext, propertyId: any) {
  const property = await ctx.db.get(propertyId);
  if (!property || !ownerMatchesProperty(owner, property)) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return property;
}

async function listDealsForOwner(ctx: any, owner: OwnerContext) {
  if (owner.tenantOrgId) {
    const deals = await ctx.db
      .query("deals")
      .withIndex("tenantOrgId", (q: any) => q.eq("tenantOrgId", owner.tenantOrgId))
      .collect();
    return Promise.all(
      deals
        .filter((deal: any) => !deal.archivedAt)
        .sort((left: any, right: any) => (right.updatedAt ?? right.createdAt ?? right._creationTime) - (left.updatedAt ?? left.createdAt ?? left._creationTime))
        .map((deal: any) => mapDealRecord(ctx, deal)),
    );
  }
  const deals = owner.ownerType === "broker"
    ? await ctx.db.query("deals").withIndex("brokerId", (q: any) => q.eq("brokerId", owner.ownerBrokerId)).collect()
    : await ctx.db.query("deals").withIndex("REDId", (q: any) => q.eq("REDId", owner.ownerREDId)).collect();

  return Promise.all(
    deals
      .filter((deal: any) => !deal.archivedAt)
      .sort((left: any, right: any) => (right.createdAt ?? right._creationTime) - (left.createdAt ?? left._creationTime))
      .map((deal: any) => mapDealRecord(ctx, deal)),
  );
}

async function getOwnedDealOrThrow(ctx: any, owner: OwnerContext, dealId: any) {
  const deal = await ctx.db.get(dealId);
  if (!deal || deal.archivedAt || !ownerMatchesDeal(owner, deal)) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Deal not found" });
  }
  return deal;
}

async function getBrokerOrThrow(ctx: any, brokerId: any) {
  const broker = await ctx.db.get(brokerId);
  if (!broker || (broker.status ?? "active") === "pending") {
    throw new ConvexError({ code: "NOT_FOUND", message: "Broker not found" });
  }
  return broker;
}

async function listBrokersDirectory(ctx: any) {
  const brokers = await ctx.db.query("brokers").collect();
  return brokers
    .filter((broker: any) => (broker.status ?? "active") !== "pending")
    .sort((left: any, right: any) => left.name.localeCompare(right.name, "ar"))
    .map(mapBrokerRecord);
}

async function createImplicitClientForDeal(args: {
  ctx: any;
  owner: OwnerContext;
  apiKey: any;
  now: number;
  contactName?: string;
  contactPhone?: string;
  description?: string;
}) {
  if (!args.contactName) return undefined;
  return args.ctx.db.insert("crmClients", {
    ownerAuthUserId: args.apiKey.createdBy,
    tenantOrgId: args.owner.tenantOrgId,
    brokerId: args.owner.ownerType === "broker" ? args.owner.ownerBrokerId : undefined,
    REDId: args.owner.ownerType === "RED" ? args.owner.ownerREDId : undefined,
    name: args.contactName,
    phone: args.contactPhone,
    notes: args.description,
    sourceClientId: args.apiKey.keyId,
    createdAt: args.now,
    updatedAt: args.now,
  });
}

/**
 * WHY:   Organization settings need a safe API key control surface with owner-only issuance.
 * WHAT:  Returns the current organization's API keys with creator metadata.
 * HOW:   Uses the dedicated API-key access helper so owners and managers can view metadata.
 */
export const listCurrentOrganizationApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireApiKeyAccess(ctx);
    const apiKeys = owner.ownerType === "broker"
      ? await ctx.db.query("organizationApiKeys").withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId)).collect()
      : await ctx.db.query("organizationApiKeys").withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId)).collect();
    const summaries = await Promise.all(apiKeys.map((apiKey: any) => mapApiKeySummary(ctx, apiKey)));
    return summaries.sort((left, right) => right.createdAt - left.createdAt);
  },
});

/**
 * WHY:   API key issuance is higher risk than revocation and should stay restricted to tenant owners.
 * WHAT:  Persists API key metadata and hashed secret for the current organization.
 * HOW:   Resolves raw tenant role, rejects non-owners, normalizes permissions, and records an audit entry.
 */
export const createCurrentOrganizationApiKey = mutation({
  args: {
    keyId: v.string(),
    prefix: v.string(),
    secretHash: v.string(),
    name: v.string(),
    permissions: v.array(apiKeyPermissionValidator),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const { owner, profile, tenantRole } = await requireApiKeyAccess(ctx);
    if (tenantRole !== "owner") {
      throw new ConvexError({ code: "FORBIDDEN", message: "Owner role required" });
    }

    const normalizedPermissions = normalizePermissions(args.permissions);
    const policy = owner.tenantOrgId
      ? await getOrganizationIntegrationPolicy(ctx, owner.tenantOrgId)
      : null;
    const apiKeyId = await ctx.db.insert("organizationApiKeys", {
      keyId: args.keyId,
      prefix: args.prefix,
      secretHash: args.secretHash,
      name: args.name,
      trustedOrigins: normalizeTrustedOrigins(policy?.trustedOrigins),
      permissions: normalizedPermissions,
      status: "active",
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      tenantOrgId: owner.tenantOrgId,
      createdBy: profile.authUserId,
      createdAt: args.now,
      lastUsedAt: undefined,
      quotaWindowMinutes: 60,
      quotaLimit: 1000,
      quotaUsed: 0,
      quotaWindowStartedAt: args.now,
      anomalyFlags: [],
    });
    await auditLog.log(ctx, {
      action: "organization.api_key.created",
      actorId: profile.authUserId,
      resourceType: "organizationApiKeys",
      resourceId: String(apiKeyId),
      severity: "info",
      tags: ["organizations", "api-keys"],
      metadata: {
        keyId: args.keyId,
        ownerType: owner.ownerType,
        tenantRole,
        permissions: normalizedPermissions,
      },
    });
    const persisted = await ctx.db.get(apiKeyId);
    return mapApiKeySummary(ctx, persisted);
  },
});

/**
 * WHY:   Managers still need an emergency stop path for compromised machine credentials.
 * WHAT:  Revokes one API key belonging to the current organization.
 * HOW:   Uses the dedicated API-key access helper, confirms owner scope, and records an audit entry.
 */
export const revokeCurrentOrganizationApiKey = mutation({
  args: {
    keyId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const { owner, profile, tenantRole } = await requireApiKeyAccess(ctx);
    const apiKey = await getCurrentOrganizationApiKeyOrThrow(ctx, args.keyId, owner);
    if (!apiKey.revokedAt) {
      await ctx.db.patch(apiKey._id, {
        status: "revoked",
        revokedAt: args.now,
      });
      await auditLog.log(ctx, {
        action: "organization.api_key.revoked",
        actorId: profile.authUserId,
        resourceType: "organizationApiKeys",
        resourceId: String(apiKey._id),
        severity: "info",
        tags: ["organizations", "api-keys"],
        metadata: {
          keyId: apiKey.keyId,
          ownerType: owner.ownerType,
          tenantRole,
        },
      });
    }
    return { revoked: true as const };
  },
});

export const listClientsByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "clients",
      action: "read",
      origin: args.origin,
    });
    return { clients: await listClientsForOwner(ctx, buildOwnerFromApiKey(apiKey)) };
  },
});

export const createClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "clients",
      action: "create",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    const clientId = await ctx.db.insert("crmClients", {
      ownerAuthUserId: apiKey.createdBy,
      tenantOrgId: owner.tenantOrgId,
      brokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      REDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      name: args.name,
      phone: args.phone,
      email: args.email,
      notes: args.notes,
      sourceClientId: apiKey.keyId,
      sourceSystem: args.sourceSystem,
      externalId: args.externalId,
      businessId: args.businessId,
      createdAt: args.now,
      updatedAt: args.now,
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.client.created",
      resourceType: "crmClients",
      resourceId: String(clientId),
    });
    return { client: mapClientRecord(await ctx.db.get(clientId)) };
  },
});

export const updateClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    clientId: v.id("crmClients"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "clients",
      action: "update",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedClientOrThrow(ctx, owner, args.clientId);
    await ctx.db.patch(args.clientId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phone !== undefined ? { phone: args.phone } : {}),
      ...(args.email !== undefined ? { email: args.email } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      ...(args.sourceSystem !== undefined ? { sourceSystem: args.sourceSystem } : {}),
      ...(args.externalId !== undefined ? { externalId: args.externalId } : {}),
      ...(args.businessId !== undefined ? { businessId: args.businessId } : {}),
      updatedAt: args.now,
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.client.updated",
      resourceType: "crmClients",
      resourceId: String(args.clientId),
    });
    return { client: mapClientRecord(await ctx.db.get(args.clientId)) };
  },
});

export const deleteClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    clientId: v.id("crmClients"),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "clients",
      action: "delete",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedClientOrThrow(ctx, owner, args.clientId);
    await ctx.db.delete(args.clientId);
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.client.deleted",
      resourceType: "crmClients",
      resourceId: String(args.clientId),
    });
    return { deleted: true as const };
  },
});

export const listPropertiesByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "properties",
      action: "read",
      origin: args.origin,
    });
    return { properties: await listPropertiesForOwner(ctx, buildOwnerFromApiKey(apiKey)) };
  },
});

export const createPropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    title: v.string(),
    address: v.string(),
    price: v.number(),
    beds: v.number(),
    baths: v.number(),
    description: v.string(),
    area: v.optional(v.string()),
    location: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "properties",
      action: "create",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    const projections = await buildPropertyProjectionFields(ctx, {
      ownerField: owner.ownerType === "broker" ? "brokerId" : "REDId",
      ownerId: owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId,
      publicationState: "draft",
    } as any);
    const propertyId = await ctx.db.insert("properties", {
      title: args.title,
      address: args.address,
      brokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      REDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      price: args.price,
      beds: args.beds,
      baths: args.baths,
      description: args.description,
      area: args.area,
      location: args.location,
      sourceSystem: args.sourceSystem,
      externalId: args.externalId,
      businessId: args.businessId,
      publicationState: "draft",
      status: "available",
      searchText: buildPropertySearchText(args),
      createdAt: args.now,
      updatedAt: args.now,
      ...projections,
    });
    await applyOrganizationProjectSummaryDelta(ctx, {
      ownerField: owner.ownerType === "broker" ? "brokerId" : "REDId",
      ownerId: owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId,
      nextPublicationState: "draft",
      createdAt: args.now,
      delta: 1,
    } as any);
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.property.created",
      resourceType: "properties",
      resourceId: String(propertyId),
    });
    return { property: mapPropertyRecord(await ctx.db.get(propertyId)) };
  },
});

export const updatePropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    price: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    description: v.optional(v.string()),
    area: v.optional(v.string()),
    location: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "properties",
      action: "update",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    const property = await getOwnedPropertyOrThrow(ctx, owner, args.propertyId);
    const nextProperty = {
      title: args.title ?? property.title,
      address: args.address ?? property.address,
      price: args.price ?? property.price,
      beds: args.beds ?? property.beds,
      baths: args.baths ?? property.baths,
      description: args.description ?? property.description,
      area: args.area ?? property.area,
      location: args.location ?? property.location,
    };
    const projections = await buildPropertyProjectionFields(ctx, {
      ownerField: owner.ownerType === "broker" ? "brokerId" : "REDId",
      ownerId: owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId,
      publicationState: property.publicationState,
      adLicenseStatus: property.adLicenseStatus,
    } as any);
    await ctx.db.patch(args.propertyId, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.address !== undefined ? { address: args.address } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.beds !== undefined ? { beds: args.beds } : {}),
      ...(args.baths !== undefined ? { baths: args.baths } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.area !== undefined ? { area: args.area } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      ...(args.sourceSystem !== undefined ? { sourceSystem: args.sourceSystem } : {}),
      ...(args.externalId !== undefined ? { externalId: args.externalId } : {}),
      ...(args.businessId !== undefined ? { businessId: args.businessId } : {}),
      searchText: buildPropertySearchText(nextProperty),
      ...projections,
      updatedAt: args.now,
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.property.updated",
      resourceType: "properties",
      resourceId: String(args.propertyId),
    });
    return { property: mapPropertyRecord(await ctx.db.get(args.propertyId)) };
  },
});

export const deletePropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "properties",
      action: "delete",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    const property = await getOwnedPropertyOrThrow(ctx, owner, args.propertyId);
    await ctx.db.delete(args.propertyId);
    await applyOrganizationProjectSummaryDelta(ctx, {
      ownerField: owner.ownerType === "broker" ? "brokerId" : "REDId",
      ownerId: owner.ownerType === "broker" ? owner.ownerBrokerId : owner.ownerREDId,
      previousPublicationState: property.publicationState,
      delta: -1,
    } as any);
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.property.deleted",
      resourceType: "properties",
      resourceId: String(args.propertyId),
    });
    return { deleted: true as const };
  },
});

export const listDealsByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "deals",
      action: "read",
      origin: args.origin,
    });
    return { deals: await listDealsForOwner(ctx, buildOwnerFromApiKey(apiKey)) };
  },
});

export const createDealByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    title: v.string(),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    stage: v.union(v.literal("new"), v.literal("contacted"), v.literal("negotiation"), v.literal("won"), v.literal("lost")),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    relationType: v.union(v.literal("internal_client"), v.literal("broker_managed")),
    clientId: v.optional(v.id("crmClients")),
    projectId: v.optional(v.id("properties")),
    brokerId: v.optional(v.id("brokers")),
    notes: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "deals",
      action: "create",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);

    const clientId = args.clientId
      ? args.clientId
      : args.relationType === "internal_client"
        ? await createImplicitClientForDeal({
            ctx,
            owner,
            apiKey,
            now: args.now,
            contactName: args.contactName,
            contactPhone: args.contactPhone,
            description: args.description,
          })
        : undefined;

    if (clientId) {
      await getOwnedClientOrThrow(ctx, owner, clientId);
    }
    if (args.projectId) {
      await getOwnedPropertyOrThrow(ctx, owner, args.projectId);
    }
    if (args.brokerId) {
      await getBrokerOrThrow(ctx, args.brokerId);
    }

    const dealId = await ctx.db.insert("deals", {
      createdAt: args.now,
      updatedAt: args.now,
      tenantOrgId: owner.tenantOrgId,
      title: args.title,
      description: args.description,
      value: args.value,
      nextFollowUpAt: args.nextFollowUpAt,
      stage: args.stage,
      relationType: args.relationType,
      crmClientId: clientId,
      relatedBrokerId: args.brokerId,
      contactName: args.contactName,
      contactPhone: args.contactPhone,
      propertyId: args.projectId,
      REDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      brokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      notes: args.notes,
      sourceSystem: args.sourceSystem,
      externalId: args.externalId,
      businessId: args.businessId,
      lastUpdatedBy: machineActorId(apiKey),
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.deal.created",
      resourceType: "deals",
      resourceId: String(dealId),
    });
    return { deal: await mapDealRecord(ctx, await ctx.db.get(dealId)) };
  },
});

export const updateDealByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    dealId: v.id("deals"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    value: v.optional(v.number()),
    nextFollowUpAt: v.optional(v.number()),
    stage: v.optional(v.union(v.literal("new"), v.literal("contacted"), v.literal("negotiation"), v.literal("won"), v.literal("lost"))),
    contactName: v.optional(v.string()),
    contactPhone: v.optional(v.string()),
    relationType: v.optional(v.union(v.literal("internal_client"), v.literal("broker_managed"))),
    clientId: v.optional(v.id("crmClients")),
    projectId: v.optional(v.id("properties")),
    brokerId: v.optional(v.id("brokers")),
    notes: v.optional(v.string()),
    sourceSystem: v.optional(v.string()),
    externalId: v.optional(v.string()),
    businessId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "deals",
      action: "update",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    const deal = await getOwnedDealOrThrow(ctx, owner, args.dealId);

    const nextRelationType = args.relationType ?? deal.relationType;
    const clientId = args.clientId
      ? args.clientId
      : !deal.crmClientId && nextRelationType === "internal_client"
        ? await createImplicitClientForDeal({
            ctx,
            owner,
            apiKey,
            now: args.now,
            contactName: args.contactName ?? deal.contactName,
            contactPhone: args.contactPhone ?? deal.contactPhone,
            description: args.description ?? deal.description,
          })
        : undefined;

    if (clientId) {
      await getOwnedClientOrThrow(ctx, owner, clientId);
    }
    if (args.projectId) {
      await getOwnedPropertyOrThrow(ctx, owner, args.projectId);
    }
    if (args.brokerId) {
      await getBrokerOrThrow(ctx, args.brokerId);
    }

    await ctx.db.patch(args.dealId, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.value !== undefined ? { value: args.value } : {}),
      ...(args.nextFollowUpAt !== undefined ? { nextFollowUpAt: args.nextFollowUpAt } : {}),
      ...(args.stage !== undefined ? { stage: args.stage } : {}),
      ...(args.contactName !== undefined ? { contactName: args.contactName } : {}),
      ...(args.contactPhone !== undefined ? { contactPhone: args.contactPhone } : {}),
      ...(args.relationType !== undefined ? { relationType: args.relationType } : {}),
      ...(args.clientId !== undefined || clientId !== undefined ? { crmClientId: args.clientId ?? clientId ?? deal.crmClientId } : {}),
      ...(args.projectId !== undefined ? { propertyId: args.projectId } : {}),
      ...(args.brokerId !== undefined ? { relatedBrokerId: args.brokerId } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      ...(args.sourceSystem !== undefined ? { sourceSystem: args.sourceSystem } : {}),
      ...(args.externalId !== undefined ? { externalId: args.externalId } : {}),
      ...(args.businessId !== undefined ? { businessId: args.businessId } : {}),
      lastUpdatedBy: machineActorId(apiKey),
      updatedAt: args.now,
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.deal.updated",
      resourceType: "deals",
      resourceId: String(args.dealId),
    });
    return { deal: await mapDealRecord(ctx, await ctx.db.get(args.dealId)) };
  },
});

export const deleteDealByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    dealId: v.id("deals"),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "deals",
      action: "delete",
      origin: args.origin,
    });
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedDealOrThrow(ctx, owner, args.dealId);
    await ctx.db.patch(args.dealId, {
      archivedAt: args.now,
      archivedBy: machineActorId(apiKey),
      lastUpdatedBy: machineActorId(apiKey),
      updatedAt: args.now,
    });
    await logMachineMutation({
      ctx,
      apiKey,
      action: "organization.machine_api.deal.deleted",
      resourceType: "deals",
      resourceId: String(args.dealId),
    });
    return { deleted: true as const };
  },
});

export const listBrokersByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "brokers",
      action: "read",
      origin: args.origin,
    });
    return { brokers: await listBrokersDirectory(ctx) };
  },
});

export const getBrokerByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    origin: v.optional(v.string()),
    brokerId: v.id("brokers"),
  },
  handler: async (ctx, args) => {
    const apiKey = await authorizeMachineRequest({
      ctx,
      secretHash: args.secretHash,
      now: args.now,
      resource: "brokers",
      action: "read",
      origin: args.origin,
    });
    const broker = await getBrokerOrThrow(ctx, args.brokerId);
    return { broker: mapBrokerRecord(broker) };
  },
});

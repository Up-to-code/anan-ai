import { ConvexError, v } from "convex/values";
import { mutation, query } from "../../../_generated/server";
import { auditLog } from "../../../auditLog";
import { findProfileByAuthUserId, type OwnerContext } from "./core";
import { requireManagerAccess } from "./membership";

const apiKeyPermissionValidator = v.object({
  resource: v.union(v.literal("clients"), v.literal("properties")),
  action: v.union(v.literal("read"), v.literal("create"), v.literal("update"), v.literal("delete")),
});

type ApiKeyPermission = {
  resource: "clients" | "properties";
  action: "read" | "create" | "update" | "delete";
};

function permissionKey(permission: ApiKeyPermission) {
  return `${permission.resource}:${permission.action}`;
}

function normalizePermissions(permissions: ApiKeyPermission[]): ApiKeyPermission[] {
  return [
    ...new Map(permissions.map((permission) => [permissionKey(permission), permission])).values(),
  ].sort((left, right) => {
    if (left.resource === right.resource) {
      return left.action.localeCompare(right.action);
    }
    return left.resource.localeCompare(right.resource);
  });
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
  } as const;
}

function ownerMatchesApiKey(owner: OwnerContext, apiKey: any) {
  if (owner.ownerType === "broker") {
    return apiKey.ownerType === "broker" && apiKey.ownerBrokerId === owner.ownerBrokerId;
  }
  return apiKey.ownerType === "RED" && apiKey.ownerREDId === owner.ownerREDId;
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
  if (!apiKey || apiKey.status !== "active" || apiKey.revokedAt) {
    throw new ConvexError({ code: "UNAUTHORIZED", message: "Invalid API key" });
  }
  return apiKey;
}

function requireApiKeyPermission(apiKey: any, resource: "clients" | "properties", action: "read" | "create" | "update" | "delete") {
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

function mapClientRecord(client: any) {
  return {
    id: String(client._id),
    name: client.name,
    phone: client.phone,
    email: client.email,
    notes: client.notes,
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
    brokerId: property.brokerId ? String(property.brokerId) : undefined,
    redId: property.REDId ? String(property.REDId) : undefined,
    status: property.status,
    publicationState: property.publicationState,
  } as const;
}

async function listClientsForOwner(ctx: any, owner: OwnerContext) {
  if (owner.ownerType === "broker") {
    const clients = await ctx.db
      .query("crmClients")
      .withIndex("brokerId", (q: any) => q.eq("brokerId", owner.ownerBrokerId))
      .collect();
    return clients.map(mapClientRecord);
  }
  const clients = await ctx.db
    .query("crmClients")
    .withIndex("REDId", (q: any) => q.eq("REDId", owner.ownerREDId))
    .collect();
  return clients.map(mapClientRecord);
}

async function getOwnedClientOrThrow(ctx: any, owner: OwnerContext, clientId: any) {
  const client = await ctx.db.get(clientId);
  if (!client) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Client not found" });
  }
  const owned = owner.ownerType === "broker"
    ? client.brokerId === owner.ownerBrokerId
    : client.REDId === owner.ownerREDId;
  if (!owned) {
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
  if (!property) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  const owned = owner.ownerType === "broker"
    ? property.brokerId === owner.ownerBrokerId
    : property.REDId === owner.ownerREDId;
  if (!owned) {
    throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
  }
  return property;
}

/**
 * WHY:   Organization settings need a manager-only list of active and revoked API keys.
 * WHAT:  Returns the current organization's API keys with creator metadata.
 * HOW:   Enforces manager access, scopes records to the current owner, and maps rows into stable summaries.
 */
export const listCurrentOrganizationApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const { owner } = await requireManagerAccess(ctx);
    const apiKeys = owner.ownerType === "broker"
      ? await ctx.db.query("organizationApiKeys").withIndex("ownerBrokerId", (q: any) => q.eq("ownerBrokerId", owner.ownerBrokerId)).collect()
      : await ctx.db.query("organizationApiKeys").withIndex("ownerREDId", (q: any) => q.eq("ownerREDId", owner.ownerREDId)).collect();
    const summaries = await Promise.all(apiKeys.map((apiKey: any) => mapApiKeySummary(ctx, apiKey)));
    return summaries.sort((left, right) => right.createdAt - left.createdAt);
  },
});

/**
 * WHY:   Managers need to create org-owned machine credentials without exposing raw secrets to Convex logs or storage.
 * WHAT:  Persists API key metadata and hashed secret for the current organization.
 * HOW:   Requires manager access, stores normalized permissions, and records an audit entry.
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
    const { owner, profile } = await requireManagerAccess(ctx);
    const normalizedPermissions = normalizePermissions(args.permissions);
    const apiKeyId = await ctx.db.insert("organizationApiKeys", {
      keyId: args.keyId,
      prefix: args.prefix,
      secretHash: args.secretHash,
      name: args.name,
      permissions: normalizedPermissions,
      status: "active",
      ownerType: owner.ownerType,
      ownerBrokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      ownerREDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      tenantOrgId: owner.tenantOrgId,
      createdBy: profile.authUserId,
      createdAt: args.now,
      lastUsedAt: undefined,
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
        permissions: normalizedPermissions,
      },
    });
    const persisted = await ctx.db.get(apiKeyId);
    return mapApiKeySummary(ctx, persisted);
  },
});

/**
 * WHY:   Managers need a safe revocation path that immediately disables future machine API access.
 * WHAT:  Revokes one API key belonging to the current organization.
 * HOW:   Confirms owner scope, timestamps revocation, and records an audit entry.
 */
export const revokeCurrentOrganizationApiKey = mutation({
  args: {
    keyId: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const { owner, profile } = await requireManagerAccess(ctx);
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
        },
      });
    }
    return { revoked: true as const };
  },
});

/**
 * WHY:   Machine integrations need a key-authenticated list endpoint that updates usage metadata.
 * WHAT:  Returns CRM clients owned by the API key's organization.
 * HOW:   Resolves the key from its hash, checks read permission, touches last-used, and scopes by org ownership.
 */
export const listClientsByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "clients", "read");
    await touchApiKey(ctx, apiKey._id, args.now);
    return { clients: await listClientsForOwner(ctx, buildOwnerFromApiKey(apiKey)) };
  },
});

/**
 * WHY:   Machine integrations need org-scoped CRM writes without user session context.
 * WHAT:  Creates a CRM client for the organization represented by the API key.
 * HOW:   Verifies create permission, writes owner-linked fields, and updates key last-used metadata.
 */
export const createClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "clients", "create");
    const owner = buildOwnerFromApiKey(apiKey);
    const clientId = await ctx.db.insert("crmClients", {
      ownerAuthUserId: apiKey.createdBy,
      brokerId: owner.ownerType === "broker" ? owner.ownerBrokerId : undefined,
      REDId: owner.ownerType === "RED" ? owner.ownerREDId : undefined,
      name: args.name,
      phone: args.phone,
      email: args.email,
      notes: args.notes,
      sourceClientId: apiKey.keyId,
      createdAt: args.now,
      updatedAt: args.now,
    });
    await touchApiKey(ctx, apiKey._id, args.now);
    return { client: mapClientRecord(await ctx.db.get(clientId)) };
  },
});

/**
 * WHY:   Machine integrations need a safe client update path limited to the owning organization.
 * WHAT:  Updates one CRM client reachable by the API key.
 * HOW:   Verifies update permission, rejects foreign ids, patches fields, and refreshes last-used metadata.
 */
export const updateClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    clientId: v.id("crmClients"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "clients", "update");
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedClientOrThrow(ctx, owner, args.clientId);
    await ctx.db.patch(args.clientId, {
      ...(args.name !== undefined ? { name: args.name } : {}),
      ...(args.phone !== undefined ? { phone: args.phone } : {}),
      ...(args.email !== undefined ? { email: args.email } : {}),
      ...(args.notes !== undefined ? { notes: args.notes } : {}),
      updatedAt: args.now,
    });
    await touchApiKey(ctx, apiKey._id, args.now);
    return { client: mapClientRecord(await ctx.db.get(args.clientId)) };
  },
});

/**
 * WHY:   Machine integrations need revocable destructive access that never escapes org ownership.
 * WHAT:  Deletes one CRM client owned by the API key's organization.
 * HOW:   Checks delete permission, ensures ownership, removes the row, and touches last-used metadata.
 */
export const deleteClientByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    clientId: v.id("crmClients"),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "clients", "delete");
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedClientOrThrow(ctx, owner, args.clientId);
    await ctx.db.delete(args.clientId);
    await touchApiKey(ctx, apiKey._id, args.now);
    return { deleted: true as const };
  },
});

/**
 * WHY:   Machine integrations need an org-scoped property read endpoint backed by the same key policy model.
 * WHAT:  Returns properties owned by the API key's organization.
 * HOW:   Verifies read permission, scopes by broker/RED ownership, and updates last-used metadata.
 */
export const listPropertiesByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "properties", "read");
    await touchApiKey(ctx, apiKey._id, args.now);
    return { properties: await listPropertiesForOwner(ctx, buildOwnerFromApiKey(apiKey)) };
  },
});

/**
 * WHY:   Machine integrations need property creation tied to the owning organization rather than a user profile.
 * WHAT:  Creates a property for the org represented by the API key.
 * HOW:   Checks create permission, writes the owner ids, derives search text, and touches last-used metadata.
 */
export const createPropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    title: v.string(),
    address: v.string(),
    price: v.number(),
    beds: v.number(),
    baths: v.number(),
    description: v.string(),
    area: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "properties", "create");
    const owner = buildOwnerFromApiKey(apiKey);
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
      publicationState: "draft",
      status: "available",
      searchText: buildPropertySearchText(args),
    });
    await touchApiKey(ctx, apiKey._id, args.now);
    return { property: mapPropertyRecord(await ctx.db.get(propertyId)) };
  },
});

/**
 * WHY:   Machine integrations need property updates constrained to org-owned records.
 * WHAT:  Updates one property for the current API key owner.
 * HOW:   Verifies update permission, rejects foreign property ids, recomputes search text, and touches last-used metadata.
 */
export const updatePropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    propertyId: v.id("properties"),
    title: v.optional(v.string()),
    address: v.optional(v.string()),
    price: v.optional(v.number()),
    beds: v.optional(v.number()),
    baths: v.optional(v.number()),
    description: v.optional(v.string()),
    area: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "properties", "update");
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
    await ctx.db.patch(args.propertyId, {
      ...(args.title !== undefined ? { title: args.title } : {}),
      ...(args.address !== undefined ? { address: args.address } : {}),
      ...(args.price !== undefined ? { price: args.price } : {}),
      ...(args.beds !== undefined ? { beds: args.beds } : {}),
      ...(args.baths !== undefined ? { baths: args.baths } : {}),
      ...(args.description !== undefined ? { description: args.description } : {}),
      ...(args.area !== undefined ? { area: args.area } : {}),
      ...(args.location !== undefined ? { location: args.location } : {}),
      searchText: buildPropertySearchText(nextProperty),
    });
    await touchApiKey(ctx, apiKey._id, args.now);
    return { property: mapPropertyRecord(await ctx.db.get(args.propertyId)) };
  },
});

/**
 * WHY:   Machine integrations need a destructive property path that still respects org boundaries.
 * WHAT:  Deletes one property owned by the API key's organization.
 * HOW:   Checks delete permission, confirms ownership, removes the record, and updates last-used metadata.
 */
export const deletePropertyByApiKey = mutation({
  args: {
    secretHash: v.string(),
    now: v.number(),
    propertyId: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const apiKey = await getApiKeyBySecretHashOrThrow(ctx, args.secretHash);
    requireApiKeyPermission(apiKey, "properties", "delete");
    const owner = buildOwnerFromApiKey(apiKey);
    await getOwnedPropertyOrThrow(ctx, owner, args.propertyId);
    await ctx.db.delete(args.propertyId);
    await touchApiKey(ctx, apiKey._id, args.now);
    return { deleted: true as const };
  },
});

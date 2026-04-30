import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";

/**
 * WHY:   Third-party apps need a concrete org-owned resource to exercise delegated client scopes.
 * WHAT:  Creates a CRM client scoped to the connected organization.
 * HOW:   Persists tenant ownership and mirrors broker/RED links while keeping the legacy auth-user field only as metadata.
 */
export const createDelegatedClient = internalMutation({
  args: {
    ownerAuthUserId: v.string(),
    tenantOrgId: v.string(),
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
    sourceClientId: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    now: v.number(),
  },
  handler: async (ctx, args) => {
    const clientId = await ctx.db.insert("crmClients", {
      ownerAuthUserId: args.ownerAuthUserId,
      tenantOrgId: args.tenantOrgId,
      brokerId: args.brokerId,
      REDId: args.REDId,
      name: args.name,
      phone: args.phone,
      email: args.email,
      notes: args.notes,
      sourceClientId: args.sourceClientId,
      createdAt: args.now,
      updatedAt: args.now,
    });
    return ctx.db.get(clientId);
  },
});

/**
 * WHY:   Third-party apps with delegated read scopes must stay inside the connected organization boundary.
 * WHAT:  Lists CRM clients for the connected organization.
 * HOW:   Filters on `tenantOrgId`, which matches the organization ownership model used by org API keys.
 */
export const listDelegatedClients = internalQuery({
  args: {
    tenantOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("crmClients")
      .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", args.tenantOrgId))
      .collect();
  },
});

/**
 * WHY:   External apps need a real delegated property write path inside the connected organization.
 * WHAT:  Creates a draft property tied to the organization owner record.
 * HOW:   Persists tenant org ownership plus broker/RED ownership links for compatibility with existing property flows.
 */
export const createDelegatedProperty = internalMutation({
  args: {
    tenantOrgId: v.string(),
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
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
    const propertyId = await ctx.db.insert("properties", {
      title: args.title,
      address: args.address,
      tenantOrgId: args.tenantOrgId,
      brokerId: args.brokerId,
      REDId: args.REDId,
      price: args.price,
      beds: args.beds,
      baths: args.baths,
      description: args.description,
      area: args.area,
      location: args.location,
      publicationState: "draft",
      status: "available",
      searchText: [args.title, args.address, args.area, args.location, args.description].filter(Boolean).join(" "),
    });
    return ctx.db.get(propertyId);
  },
});

/**
 * WHY:   `properties:read_own` must expose only resources tied to the connected organization.
 * WHAT:  Lists properties that belong to the organization grant behind the bearer token.
 * HOW:   Filters directly on `tenantOrgId`, which keeps OAuth access aligned with org API-key ownership.
 */
export const listDelegatedProperties = internalQuery({
  args: {
    tenantOrgId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("properties")
      .withIndex("tenantOrgId", (q) => q.eq("tenantOrgId", args.tenantOrgId))
      .collect();
  },
});

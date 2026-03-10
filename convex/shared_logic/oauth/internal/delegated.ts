import { v } from "convex/values";
import { internalMutation, internalQuery } from "../../../_generated/server";

/**
 * WHY:   Third-party apps need a concrete user-owned resource to exercise delegated client scopes.
 * WHAT:  Creates a CRM client owned by the delegated Anan user.
 * HOW:   Persists ownership by auth user id and mirrors broker/RED links when present.
 */
export const createDelegatedClient = internalMutation({
  args: {
    authUserId: v.string(),
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
      ownerAuthUserId: args.authUserId,
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
 * WHY:   Third-party apps with read scopes need a bounded way to view the caller's own clients.
 * WHAT:  Lists CRM clients owned by the delegated Anan user.
 * HOW:   Filters on the owner auth user id rather than global CRM visibility.
 */
export const listDelegatedClients = internalQuery({
  args: {
    authUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("crmClients")
      .withIndex("ownerAuthUserId", (q) => q.eq("ownerAuthUserId", args.authUserId))
      .collect();
  },
});

/**
 * WHY:   Partner apps need a real delegated property write path to validate ownership scopes.
 * WHAT:  Creates a property tied to the caller's broker or RED profile.
 * HOW:   Persists broker/RED ownership links and stamps a minimal draft property record.
 */
export const createDelegatedProperty = internalMutation({
  args: {
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
 * WHY:   `properties:read_own` must expose only resources tied to the delegated caller's org links.
 * WHAT:  Lists properties owned by the caller's broker or RED profile.
 * HOW:   Collects matching broker and RED property sets and merges them without duplication.
 */
export const listDelegatedProperties = internalQuery({
  args: {
    brokerId: v.optional(v.id("brokers")),
    REDId: v.optional(v.id("RED")),
  },
  handler: async (ctx, args) => {
    const [brokerProperties, redProperties] = await Promise.all([
      args.brokerId
        ? ctx.db.query("properties").withIndex("brokerId", (q) => q.eq("brokerId", args.brokerId!)).collect()
        : Promise.resolve([]),
      args.REDId
        ? ctx.db.query("properties").withIndex("REDId", (q) => q.eq("REDId", args.REDId!)).collect()
        : Promise.resolve([]),
    ]);
    const merged = new Map<string, any>();
    for (const property of [...brokerProperties, ...redProperties]) {
      merged.set(property._id, property);
    }
    return [...merged.values()];
  },
});

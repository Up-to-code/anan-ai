import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Offers Schema
 *
 * Lifecycle:
 * - created by Broker / RED to express interest in another's property
 * - can be accepted or rejected by the property owner
 */

const offersTables = {
    offers: defineTable({
        propertyId: v.id("properties"),
        fromBrokerId: v.optional(v.id("brokers")),
        fromREDId: v.optional(v.id("RED")),
        toBrokerId: v.optional(v.id("brokers")),
        toREDId: v.optional(v.id("RED")),
        price: v.number(),
        status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
        publicationState: v.optional(
            v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
        ),
        message: v.optional(v.string()),
        // Phase 1 additions
        visibility: v.optional(v.union(v.literal("public"), v.literal("private"))),
        recipientEmail: v.optional(v.string()),
        recipientPhone: v.optional(v.string()),
        description: v.optional(v.string()),
        documentIds: v.optional(v.array(v.id("_storage"))),
    })
        .index("propertyId", ["propertyId"])
        .index("fromBrokerId", ["fromBrokerId"])
        .index("fromREDId", ["fromREDId"])
        .index("toBrokerId", ["toBrokerId"])
        .index("toREDId", ["toREDId"])
        .index("visibility", ["visibility"])
        .index("publicationState", ["publicationState"]),
};

export default offersTables;

import { defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Properties Schema
 *
 * Lifecycle:
 * - created by Broker / RED
 * - powers search engine
 */

const propertiesTables = {
    properties: defineTable({
        title: v.string(),
        address: v.string(),
        REDId: v.optional(v.id("RED")), // Link to Real Estate Developer
        brokerId: v.optional(v.id("brokers")),
        price: v.number(),
        beds: v.number(),
        baths: v.number(),
        sqft: v.optional(v.number()),
        description: v.string(),
        location: v.optional(v.string()),
        area: v.optional(v.string()),
        status: v.optional(
            v.union(v.literal("available"), v.literal("sold"), v.literal("reserved")),
        ),
        publicationState: v.optional(
            v.union(v.literal("draft"), v.literal("published"), v.literal("archived")),
        ),
        searchText: v.optional(v.string()),
        bankId: v.optional(v.id("banks")),
        imageId: v.optional(v.id("_storage")),
        imageIds: v.optional(v.array(v.id("_storage"))),
        body: v.optional(v.any()), // dynamic structured content block
    })
        .index("status", ["status"])
        .index("publicationState", ["publicationState"])
        .index("bankId", ["bankId"])
        .index("REDId", ["REDId"])
        .index("brokerId", ["brokerId"])
        .searchIndex("search_body", { searchField: "description" })
        .searchIndex("search_full", { searchField: "searchText" }),
};

export default propertiesTables;

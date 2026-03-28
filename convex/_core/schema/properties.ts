import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator, uploadedFileReferenceValidator } from "./uploadedFiles";

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
        sourceSystem: v.optional(v.string()),
        externalId: v.optional(v.string()),
        businessId: v.optional(v.string()),
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
        heroImage: v.optional(uploadedFileReferenceValidator),
        media: v.optional(uploadedFileReferenceListValidator),
        body: v.optional(v.any()), // dynamic structured content block
        adLicenseNumber: v.optional(v.string()),
        adLicenseStatus: v.optional(
            v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected")),
        ),
        adLicenseExpiresAt: v.optional(v.number()),
        adLicenseVerificationRequestId: v.optional(v.id("verificationRequests")),
    })
        .index("status", ["status"])
        .index("publicationState", ["publicationState"])
        .index("bankId", ["bankId"])
        .index("REDId", ["REDId"])
        .index("brokerId", ["brokerId"])
        .searchIndex("search_body", { searchField: "description" })
        .searchIndex("search_full", { searchField: "searchText" }),
    propertyViewerAccess: defineTable({
        propertyId: v.id("properties"),
        authUserId: v.string(),
        sharedByAuthUserId: v.optional(v.string()),
        accessSource: v.union(v.literal("manual"), v.literal("chat_share")),
        status: v.union(v.literal("active"), v.literal("revoked")),
        createdAt: v.number(),
        updatedAt: v.number(),
        lastPromotedAt: v.optional(v.number()),
    })
        .index("propertyId", ["propertyId"])
        .index("authUserId", ["authUserId"])
        .index("propertyId_authUserId", ["propertyId", "authUserId"]),
    organizationAssets: defineTable({
        tenantOrgId: v.string(),
        uploaderAuthUserId: v.string(),
        category: v.union(
            v.literal("project_image"),
            v.literal("project_document"),
            v.literal("chat_attachment"),
            v.literal("offer_attachment"),
            v.literal("verification_document"),
        ),
        kind: v.union(v.literal("image"), v.literal("pdf")),
        key: v.string(),
        url: v.string(),
        name: v.string(),
        size: v.number(),
        mime: v.string(),
        lifecycleState: v.union(
            v.literal("active"),
            v.literal("archived"),
            v.literal("pending_delete"),
            v.literal("deleted"),
        ),
        attachedEntityType: v.optional(
            v.union(v.literal("project"), v.literal("conversation"), v.literal("offer")),
        ),
        attachedEntityId: v.optional(v.string()),
        visibilityScope: v.union(
            v.literal("organization"),
            v.literal("project_private_share"),
            v.literal("public_project"),
        ),
        createdAt: v.number(),
        updatedAt: v.number(),
        scheduledDeletionAt: v.optional(v.number()),
        deletedAt: v.optional(v.number()),
        deletionReason: v.optional(v.string()),
    })
        .index("tenantOrgId", ["tenantOrgId"])
        .index("key", ["key"])
        .index("attachedEntity", ["attachedEntityType", "attachedEntityId"])
        .index("tenantOrgId_lifecycleState", ["tenantOrgId", "lifecycleState"]),
};

export default propertiesTables;

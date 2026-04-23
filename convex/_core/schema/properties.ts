import { defineTable } from "convex/server";
import { v } from "convex/values";
import { uploadedFileReferenceListValidator, uploadedFileReferenceValidator } from "./uploadedFiles";
import { transitionalGlobalSecurityFields } from "./securityFields";

/**
 * Properties Schema
 *
 * Lifecycle:
 * - created by Broker / RED
 * - powers search engine
 */

const propertiesTables = {
    properties: defineTable({
    ...transitionalGlobalSecurityFields,
        title: v.string(),
        address: v.string(),
        orgId: v.optional(v.id("organizations")),
        orgType: v.optional(v.union(v.literal("broker"), v.literal("developer"))),
        tenantOrgId: v.optional(v.string()),
        ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
        REDId: v.optional(v.id("RED")), // Link to Real Estate Developer
        brokerId: v.optional(v.id("brokers")),
        propertyType: v.optional(v.union(
            v.literal("apartment"),
            v.literal("villa"),
            v.literal("townhouse"),
            v.literal("penthouse"),
            v.literal("commercial"),
            v.literal("land"),
        )),
        countryCode: v.optional(v.string()),
        cityCode: v.optional(v.string()),
        addressLine: v.optional(v.string()),
        lat: v.optional(v.number()),
        lng: v.optional(v.number()),
        isPublished: v.optional(v.boolean()),
        publishedAt: v.optional(v.number()),
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
        projectDossierId: v.optional(v.id("projectDossiers")),
        projectReadinessStatus: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("incomplete"),
                v.literal("data_complete"),
                v.literal("compliance_pending"),
                v.literal("approved"),
                v.literal("blocked"),
                v.literal("published_ready"),
            ),
        ),
        ownerCountryCode: v.optional(v.string()),
        ownerVerified: v.optional(v.boolean()),
        listingVerified: v.optional(v.boolean()),
        isPublicSearchable: v.optional(v.boolean()),
        createdAt: v.optional(v.number()),
        updatedAt: v.optional(v.number()),
    })
        .index("by_orgId", ["orgId"])
        .index("by_orgId_and_status", ["orgId", "status"])
        .index("by_cityCode_and_isPublished", ["cityCode", "isPublished"])
        .index("by_countryCode_and_isPublished", ["countryCode", "isPublished"])
        .index("by_orgId_and_isPublished", ["orgId", "isPublished"])
        .index("tenantOrgId", ["tenantOrgId"])
        .index("tenantOrgId_updatedAt", ["tenantOrgId", "updatedAt"])
        .index("tenantOrgId_publicationState_updatedAt", ["tenantOrgId", "publicationState", "updatedAt"])
        .index("tenantOrgId_status_updatedAt", ["tenantOrgId", "status", "updatedAt"])
        .index("by_org_active_publication_updatedAt", ["orgId", "deletedAt", "publicationState", "updatedAt"])
        .index("by_org_active_status_updatedAt", ["orgId", "deletedAt", "status", "updatedAt"])
        .index("by_org_active_createdAt", ["orgId", "deletedAt", "createdAt"])
        .index("by_org_createdBy_createdAt", ["orgId", "createdBy", "createdAt"])
        .index("by_publication_city", ["publicationState", "countryCode", "cityCode"])
        .index("status", ["status"])
        .index("publicationState", ["publicationState"])
        .index("publicationState_createdAt", ["publicationState", "createdAt"])
        .index("bankId", ["bankId"])
        .index("projectDossierId", ["projectDossierId"])
        .index("projectReadinessStatus", ["projectReadinessStatus"])
        .index("REDId", ["REDId"])
        .index("REDId_publicationState_updatedAt", ["REDId", "publicationState", "updatedAt"])
        .index("REDId_status_updatedAt", ["REDId", "status", "updatedAt"])
        .index("brokerId", ["brokerId"])
        .index("brokerId_publicationState_updatedAt", ["brokerId", "publicationState", "updatedAt"])
        .index("brokerId_status_updatedAt", ["brokerId", "status", "updatedAt"])
        .searchIndex("search_body", { searchField: "description" })
        .searchIndex("search_full", { searchField: "searchText" }),
    propertyViewerAccess: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
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
        .index("propertyId_authUserId", ["propertyId", "authUserId"])
        .index("by_authUser_status", ["authUserId", "status"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),
    projectAnalyticsEvents: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        propertyId: v.id("properties"),
        eventType: v.union(
            v.literal("project_detail_view"),
            v.literal("project_analytics_view"),
            v.literal("project_analyze_click"),
            v.literal("project_edit_click"),
            v.literal("project_create_offer_click"),
            v.literal("project_open_inbox_click"),
            v.literal("project_asset_open_click"),
        ),
        actorAuthUserId: v.optional(v.string()),
        actorAudience: v.optional(
            v.union(
                v.literal("broker"),
                v.literal("developer"),
                v.literal("user"),
            ),
        ),
        source: v.string(),
        conversationId: v.optional(v.id("inboxConversations")),
        offerCaseId: v.optional(v.id("offerCases")),
        dealId: v.optional(v.id("deals")),
        metadata: v.optional(v.any()),
        createdAt: v.number(),
        tenantOrgId: v.optional(v.string()),
        ownerType: v.optional(v.union(v.literal("broker"), v.literal("RED"))),
    })
        .index("propertyId", ["propertyId"])
        .index("propertyId_createdAt", ["propertyId", "createdAt"])
        .index("propertyId_eventType", ["propertyId", "eventType"])
        .index("propertyId_eventType_createdAt", ["propertyId", "eventType", "createdAt"])
        .index("by_org_createdAt", ["orgId", "createdAt"]),
    propertyEngagementDaily: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        propertyId: v.id("properties"),
        tenantOrgId: v.string(),
        dateKey: v.string(),
        views: v.number(),
        clicks: v.number(),
        viewers: v.number(),
        updatedAt: v.number(),
        lastEventAt: v.optional(v.number()),
    })
        .index("propertyId_dateKey", ["propertyId", "dateKey"])
        .index("tenantOrgId_dateKey", ["tenantOrgId", "dateKey"])
        .index("by_org_dateKey", ["orgId", "dateKey"]),
    propertyBrokerAnalytics: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        propertyId: v.id("properties"),
        tenantOrgId: v.string(),
        brokerId: v.id("brokers"),
        views: v.number(),
        clicks: v.number(),
        totalTrackedCustomers: v.number(),
        brokerManagedCustomers: v.number(),
        internalCustomers: v.number(),
        closedWonCustomers: v.number(),
        closedLostCustomers: v.number(),
        activityCounts: v.object({
            new_client: v.number(),
            in_call: v.number(),
            interested: v.number(),
            visit_requested: v.number(),
            visit_scheduled: v.number(),
            permit_review: v.number(),
            closed_won: v.number(),
            closed_lost: v.number(),
        }),
        currentActivityKey: v.optional(
            v.union(
                v.literal("new_client"),
                v.literal("in_call"),
                v.literal("interested"),
                v.literal("visit_requested"),
                v.literal("visit_scheduled"),
                v.literal("permit_review"),
                v.literal("closed_won"),
                v.literal("closed_lost"),
            ),
        ),
        state: v.union(
            v.literal("viewer_only"),
            v.literal("offer_active"),
            v.literal("client_linked"),
            v.literal("closed_won"),
            v.literal("closed_lost"),
        ),
        lastActivityAt: v.optional(v.number()),
        updatedAt: v.number(),
    })
        .index("propertyId_brokerId", ["propertyId", "brokerId"])
        .index("propertyId_lastActivityAt", ["propertyId", "lastActivityAt"])
        .index("tenantOrgId_lastActivityAt", ["tenantOrgId", "lastActivityAt"])
        .index("by_org_lastActivityAt", ["orgId", "lastActivityAt"]),
    organizationProjectSummaries: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
        tenantOrgId: v.string(),
        ownerType: v.union(v.literal("broker"), v.literal("RED")),
        ownerBrokerId: v.optional(v.id("brokers")),
        ownerREDId: v.optional(v.id("RED")),
        propertyCount: v.number(),
        publishedPropertyCount: v.number(),
        draftPropertyCount: v.number(),
        archivedPropertyCount: v.number(),
        lastPropertyCreatedAt: v.optional(v.number()),
        updatedAt: v.number(),
    })
        .index("tenantOrgId", ["tenantOrgId"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"])
        .index("ownerBrokerId", ["ownerBrokerId"])
        .index("ownerREDId", ["ownerREDId"]),
    organizationAssets: defineTable({
    ...transitionalGlobalSecurityFields,
        orgId: v.optional(v.id("organizations")),
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
        .index("tenantOrgId_lifecycleState", ["tenantOrgId", "lifecycleState"])
        .index("by_org_active_updatedAt", ["orgId", "deletedAt", "updatedAt"]),
};

export default propertiesTables;

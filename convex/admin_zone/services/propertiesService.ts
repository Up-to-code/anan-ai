import { ConvexError } from "convex/values";
import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { buildPropertySearchText } from "../../shared_logic/properties/searchText";
import {
    applyOrganizationProjectSummaryDelta,
    buildPropertyProjectionFields,
} from "../../shared_logic/properties/projections";

export const buildSearchText = buildPropertySearchText;

export async function listPropertiesService(ctx: QueryCtx, { paginationOpts, status, REDId, brokerId }: any) {
    if (REDId) {
        return ctx.db
            .query("properties")
            .withIndex("REDId", (idx) => idx.eq("REDId", REDId))
            .order("desc")
            .paginate(paginationOpts);
    }
    if (brokerId) {
        return ctx.db
            .query("properties")
            .withIndex("brokerId", (idx) => idx.eq("brokerId", brokerId))
            .order("desc")
            .paginate(paginationOpts);
    }
    if (status) {
        return ctx.db
            .query("properties")
            .withIndex("status", (idx) => idx.eq("status", status))
            .order("desc")
            .paginate(paginationOpts);
    }
    return ctx.db.query("properties").order("desc").paginate(paginationOpts);
}

export async function getPropertyService(ctx: QueryCtx, { id }: { id: Id<"properties"> }) {
    return ctx.db.get(id);
}

export async function createPropertyService(ctx: MutationCtx, args: any) {
    const { REDId, brokerId, ...rest } = args;
    const searchText = buildPropertySearchText(rest);
    const ownerField = REDId ? "REDId" : "brokerId";
    const ownerId = REDId ?? brokerId;
    const now = Date.now();
    const projections = ownerId
        ? await buildPropertyProjectionFields(ctx, {
            ownerField,
            ownerId,
            publicationState: "published",
            adLicenseStatus: rest.adLicenseStatus,
        } as any)
        : {};
    const propertyId = await ctx.db.insert("properties", {
        ...rest,
        searchText,
        ...projections,
        publicationState: "published",
        createdAt: now,
        updatedAt: now,
        ...(REDId && { REDId }),
        ...(brokerId && { brokerId }),
    });
    if (ownerId) {
        await applyOrganizationProjectSummaryDelta(ctx, {
            ownerField,
            ownerId,
            nextPublicationState: "published",
            createdAt: now,
            delta: 1,
        } as any);
    }
    return propertyId;
}

export async function updatePropertyService(ctx: MutationCtx, { id, ...patch }: any) {
    const existing: any = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
    const merged = { ...existing, ...patch };
    const searchText = buildPropertySearchText(merged);
    const ownerField = existing.REDId ? "REDId" : "brokerId";
    const ownerId = existing.REDId ?? existing.brokerId;
    const projections = ownerId
        ? await buildPropertyProjectionFields(ctx, {
            ownerField,
            ownerId,
            publicationState: merged.publicationState,
            adLicenseStatus: merged.adLicenseStatus,
        } as any)
        : {};
    await ctx.db.patch(id, { ...patch, searchText, ...projections, updatedAt: Date.now() });
    if (ownerId && existing.publicationState !== merged.publicationState) {
        await applyOrganizationProjectSummaryDelta(ctx, {
            ownerField,
            ownerId,
            previousPublicationState: existing.publicationState,
            nextPublicationState: merged.publicationState,
        } as any);
    }
}

export async function deletePropertyService(ctx: MutationCtx, { id }: { id: Id<"properties"> }) {
    const existing: any = await ctx.db.get(id);
    if (!existing) throw new ConvexError({ code: "NOT_FOUND", message: "Property not found" });
    await ctx.db.delete(id);
    const ownerField = existing.REDId ? "REDId" : "brokerId";
    const ownerId = existing.REDId ?? existing.brokerId;
    if (ownerId) {
        await applyOrganizationProjectSummaryDelta(ctx, {
            ownerField,
            ownerId,
            previousPublicationState: existing.publicationState,
            delta: -1,
        } as any);
    }
}

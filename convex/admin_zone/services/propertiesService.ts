import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { buildPropertySearchText } from "../../shared_logic/properties/searchText";

export const buildSearchText = buildPropertySearchText;

export async function listPropertiesService(ctx: QueryCtx, { paginationOpts, status, REDId }: any) {
    if (REDId) {
        return ctx.db
            .query("properties")
            .withIndex("REDId", (idx) => idx.eq("REDId", REDId))
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
    const { REDId, ...rest } = args;
    const searchText = buildPropertySearchText(rest);
    return ctx.db.insert("properties", {
        ...rest,
        searchText,
        publicationState: "published",
        ...(REDId && { REDId }),
    });
}

export async function updatePropertyService(ctx: MutationCtx, { id, ...patch }: any) {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Property not found");
    const merged = { ...existing, ...patch };
    const searchText = buildPropertySearchText(merged);
    await ctx.db.patch(id, { ...patch, searchText });
}

export async function deletePropertyService(ctx: MutationCtx, { id }: { id: Id<"properties"> }) {
    const existing = await ctx.db.get(id);
    if (!existing) throw new Error("Property not found");
    await ctx.db.delete(id);
}

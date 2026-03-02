import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { buildSearchText } from "../../admin_zone/services/propertiesService";

export async function listMyPropertiesService(ctx: QueryCtx, { paginationOpts, status, REDId }: { paginationOpts: any, status?: any, REDId: Id<"RED"> }) {
    if (status) {
        return ctx.db
            .query("properties")
            .withIndex("REDId", (q) => q.eq("REDId", REDId))
            .filter((q) => q.eq(q.field("status"), status))
            .order("desc")
            .paginate(paginationOpts);
    }
    return ctx.db
        .query("properties")
        .withIndex("REDId", (q) => q.eq("REDId", REDId))
        .order("desc")
        .paginate(paginationOpts);
}

export async function getPropertyService(ctx: QueryCtx, { id, REDId }: { id: Id<"properties">, REDId: Id<"RED"> }) {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    if (doc.REDId !== REDId) return null;
    return doc;
}

export async function createPropertyService(ctx: MutationCtx, args: any) {
    const { REDId, ...rest } = args;
    const searchText = buildSearchText(rest);
    return ctx.db.insert("properties", { ...rest, searchText, REDId, publicationState: "draft" });
}

export async function updatePropertyService(ctx: MutationCtx, { id, REDId, ...patch }: any) {
    const existing = await ctx.db.get(id as Id<"properties">);
    if (!existing || existing.REDId !== REDId) {
        throw new Error("Property not found");
    }
    const merged = { ...existing, ...patch };
    const searchText = buildSearchText(merged);
    await ctx.db.patch(id, { ...patch, searchText });
}

export async function deletePropertyService(ctx: MutationCtx, { id, REDId }: { id: Id<"properties">, REDId: Id<"RED"> }) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.REDId !== REDId) {
        throw new Error("Property not found");
    }
    await ctx.db.delete(id);
}

export async function publishPropertyService(
    ctx: MutationCtx,
    { id, REDId }: { id: Id<"properties">; REDId: Id<"RED"> },
) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.REDId !== REDId) {
        throw new Error("Property not found");
    }
    await ctx.db.patch(id, { publicationState: "published" });
    return { ok: true } as const;
}

import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id } from "../../_generated/dataModel";
import { buildSearchText } from "../../admin_zone/services/propertiesService";

export async function listMyPropertiesService(ctx: QueryCtx, { paginationOpts, status, brokerId }: { paginationOpts: any, status?: any, brokerId: Id<"brokers"> }) {
    if (status) {
        return ctx.db
            .query("properties")
            .withIndex("brokerId", (q) => q.eq("brokerId", brokerId))
            .filter((q) => q.eq(q.field("status"), status))
            .order("desc")
            .paginate(paginationOpts);
    }
    return ctx.db
        .query("properties")
        .withIndex("brokerId", (q) => q.eq("brokerId", brokerId))
        .order("desc")
        .paginate(paginationOpts);
}

export async function getPropertyService(ctx: QueryCtx, { id, brokerId }: { id: Id<"properties">, brokerId: Id<"brokers"> }) {
    const doc = await ctx.db.get(id);
    if (!doc) return null;
    if (doc.brokerId !== brokerId) return null;
    return doc;
}

export async function createPropertyService(ctx: MutationCtx, args: any) {
    const { brokerId, ...rest } = args;
    const searchText = buildSearchText(rest);
    return ctx.db.insert("properties", { ...rest, searchText, brokerId, publicationState: "draft" });
}

export async function updatePropertyService(ctx: MutationCtx, { id, brokerId, ...patch }: any) {
    const existing = await ctx.db.get(id as Id<"properties">);
    if (!existing || existing.brokerId !== brokerId) {
        throw new Error("Property not found");
    }
    const merged = { ...existing, ...patch };
    const searchText = buildSearchText(merged);
    await ctx.db.patch(id, { ...patch, searchText });
}

export async function deletePropertyService(ctx: MutationCtx, { id, brokerId }: { id: Id<"properties">, brokerId: Id<"brokers"> }) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.brokerId !== brokerId) {
        throw new Error("Property not found");
    }
    await ctx.db.delete(id);
}

export async function publishPropertyService(
    ctx: MutationCtx,
    { id, brokerId }: { id: Id<"properties">; brokerId: Id<"brokers"> },
) {
    const existing = await ctx.db.get(id);
    if (!existing || existing.brokerId !== brokerId) {
        throw new Error("Property not found");
    }
    await ctx.db.patch(id, { publicationState: "published" });
    return { ok: true } as const;
}

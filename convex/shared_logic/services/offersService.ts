import { QueryCtx, MutationCtx } from "../../_generated/server";
import { Id, Doc } from "../../_generated/dataModel";
import { authComponent } from "../../_core/auth";
import { ConvexError } from "convex/values";

// ─── Helpers ──────────────────────────────────────────────────────────────────
export async function getProfileService(ctx: QueryCtx | MutationCtx) {
    const authUser = await authComponent.getAuthUser(ctx);
    if (!authUser) throw new Error("Unauthorized");
    const authUserId = authUser.userId ?? String((authUser as any)?._id ?? "");
    const profile = await ctx.db
        .query("userProfiles")
        .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
        .first();
    if (!profile) throw new Error("Profile not found");
    if (profile.isActive === false) {
        throw new ConvexError({ code: "ACCOUNT_INACTIVE", message: "Account is deactivated" });
    }
    return { authUser, authUserId, profile };
}

async function ensureVerifiedSender(ctx: MutationCtx) {
    const { profile } = await getProfileService(ctx);

    if (profile.brokerId) {
        const broker = await ctx.db.get(profile.brokerId);
        if (!broker?.isVerified) throw new Error("Broker verification required");
    }
    if (profile.REDId) {
        const red = await ctx.db.get(profile.REDId);
        if (!red?.isVerified) throw new Error("RED verification required");
    }

    return profile;
}

async function ensureSender(ctx: MutationCtx) {
    const { profile } = await getProfileService(ctx);
    if (!profile.brokerId && !profile.REDId) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Broker or RED profile required" });
    }
    return profile;
}

// ─── Services ─────────────────────────────────────────────────────────────────
export async function createOfferService(ctx: MutationCtx, args: any) {
    const profile = await ensureSender(ctx);

    const property = await ctx.db.get(args.propertyId);
    if (!property) throw new Error("Property not found");

    const vis = args.visibility ?? "private";

    let toBrokerId = args.toBrokerId;
    let toREDId = args.toREDId;

    if (vis === "private" && !toBrokerId && !toREDId) {
        if (args.recipientEmail) {
            const broker = await ctx.db
                .query("brokers")
                .filter((q: any) => q.eq(q.field("contactEmail"), args.recipientEmail))
                .first();
            if (broker) toBrokerId = broker._id;

            if (!toBrokerId) {
                const red = await ctx.db
                    .query("RED")
                    .filter((q: any) => q.eq(q.field("contactEmail"), args.recipientEmail))
                    .first();
                if (red) toREDId = red._id;
            }
        }
        if (!toBrokerId && !toREDId && args.recipientPhone) {
            const broker = await ctx.db
                .query("brokers")
                .filter((q: any) => q.eq(q.field("phone"), args.recipientPhone))
                .first();
            if (broker) toBrokerId = broker._id;

            if (!toBrokerId) {
                const red = await ctx.db
                    .query("RED")
                    .filter((q: any) => q.eq(q.field("phone"), args.recipientPhone))
                    .first();
                if (red) toREDId = red._id;
            }
        }
    }

    return await ctx.db.insert("offers", {
        propertyId: args.propertyId,
        fromBrokerId: profile.brokerId,
        fromREDId: profile.REDId,
        toBrokerId,
        toREDId,
        price: args.price,
        message: args.message,
        description: args.description,
        publicationState: "draft",
        visibility: vis,
        recipientEmail: args.recipientEmail,
        recipientPhone: args.recipientPhone,
        documentIds: args.documentIds,
        status: "pending",
    });
}

export async function publishOfferService(ctx: MutationCtx, args: { id: Id<"offers"> }) {
    const profile = await ensureVerifiedSender(ctx);
    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");

    const isSender =
        (profile.brokerId && offer.fromBrokerId === profile.brokerId) ||
        (profile.REDId && offer.fromREDId === profile.REDId);

    if (!isSender) {
        throw new ConvexError({ code: "FORBIDDEN", message: "Only offer owner can publish draft" });
    }

    await ctx.db.patch(args.id, { publicationState: "published" });
    return { ok: true } as const;
}

export async function updateOfferStatusService(ctx: MutationCtx, args: { id: Id<"offers">, status: "accepted" | "rejected" }) {
    const { profile, authUserId } = await getProfileService(ctx);

    const offer = await ctx.db.get(args.id);
    if (!offer) throw new Error("Offer not found");

    const isRecipient =
        (offer.toBrokerId && offer.toBrokerId === profile.brokerId) ||
        (offer.toREDId && offer.toREDId === profile.REDId);

    const isPublic = offer.visibility === "public";

    if (!isRecipient && !isPublic) throw new Error("Unauthorized");

    await ctx.db.patch(args.id, { status: args.status });

    if (args.status === "accepted") {
        const property = await ctx.db.get(offer.propertyId);
        await ctx.db.insert("deals", {
            title: `عرض مقبول — ${property?.title ?? "عقار"}`,
            description: offer.description ?? offer.message ?? "",
            value: offer.price,
            stage: "new",
            REDId: offer.fromREDId ?? offer.toREDId,
            brokerId: offer.fromBrokerId ?? offer.toBrokerId,
            propertyId: offer.propertyId,
            offerId: offer._id,
            lastUpdatedBy: authUserId,
        });
    }
}

export async function applyToOfferService(ctx: MutationCtx, args: { offerId: Id<"offers">, message?: string }) {
    const profile = await ensureVerifiedSender(ctx);

    const offer = await ctx.db.get(args.offerId);
    if (!offer) throw new Error("Offer not found");
    if (offer.visibility !== "public") throw new Error("Cannot apply to a private offer");
    if (offer.publicationState === "draft" || offer.publicationState === "archived") {
        throw new Error("Cannot apply to an unpublished offer");
    }

    await ctx.db.patch(args.offerId, {
        status: "accepted",
        toBrokerId: profile.brokerId,
        toREDId: profile.REDId,
        message: args.message ?? offer.message,
    });

    const property = await ctx.db.get(offer.propertyId);
    await ctx.db.insert("deals", {
        title: `عرض عام مقبول — ${property?.title ?? "عقار"}`,
        value: offer.price,
        stage: "new",
        REDId: offer.fromREDId ?? profile.REDId,
        brokerId: offer.fromBrokerId ?? profile.brokerId,
        propertyId: offer.propertyId,
        offerId: offer._id,
    });
}

export async function listSentOffersService(ctx: QueryCtx) {
    let authUser;
    try {
        authUser = await authComponent.getAuthUser(ctx);
    } catch {
        return [];
    }
    if (!authUser) return [];
    const authUserId = authUser.userId ?? String((authUser as any)?._id ?? "");

    const profile = await ctx.db
        .query("userProfiles")
        .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
        .first();
    if (!profile) return [];

    let results: Doc<"offers">[] = [];
    if (profile.brokerId) {
        results = await ctx.db
            .query("offers")
            .withIndex("fromBrokerId", (q) => q.eq("fromBrokerId", profile.brokerId as Id<"brokers">))
            .collect();
    } else if (profile.REDId) {
        results = await ctx.db
            .query("offers")
            .withIndex("fromREDId", (q) => q.eq("fromREDId", profile.REDId as Id<"RED">))
            .collect();
    }

    return await Promise.all(results.map(async (offer) => {
        const property = await ctx.db.get(offer.propertyId);
        return { ...offer, property };
    }));
}

export async function listReceivedOffersService(ctx: QueryCtx) {
    let authUser;
    try {
        authUser = await authComponent.getAuthUser(ctx);
    } catch {
        return [];
    }
    if (!authUser) return [];
    const authUserId = authUser.userId ?? String((authUser as any)?._id ?? "");

    const profile = await ctx.db
        .query("userProfiles")
        .withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId))
        .first();
    if (!profile) return [];

    let results: Doc<"offers">[] = [];
    if (profile.brokerId) {
        results = await ctx.db
            .query("offers")
            .withIndex("toBrokerId", (q) => q.eq("toBrokerId", profile.brokerId as Id<"brokers">))
            .collect();
    } else if (profile.REDId) {
        results = await ctx.db
            .query("offers")
            .withIndex("toREDId", (q) => q.eq("toREDId", profile.REDId as Id<"RED">))
            .collect();
    }

    const visible = results.filter((offer) => offer.publicationState !== "draft" && offer.publicationState !== "archived");
    return await Promise.all(visible.map(async (offer) => {
        const property = await ctx.db.get(offer.propertyId);
        let senderName = "غير معروف";
        if (offer.fromBrokerId) {
            const broker = await ctx.db.get(offer.fromBrokerId);
            if (broker) senderName = broker.name;
        } else if (offer.fromREDId) {
            const red = await ctx.db.get(offer.fromREDId);
            if (red) senderName = red.name;
        }
        return { ...offer, property, senderName };
    }));
}

export async function listPublicOffersService(ctx: QueryCtx) {
    let authUser;
    try {
        authUser = await authComponent.getAuthUser(ctx);
    } catch {
        return [];
    }
    if (!authUser) return [];

    const results = await ctx.db
        .query("offers")
        .withIndex("visibility", (q) => q.eq("visibility", "public"))
        .filter((q) => q.eq(q.field("status"), "pending"))
        .collect();

    const visible = results.filter((offer) => offer.publicationState !== "draft" && offer.publicationState !== "archived");
    return await Promise.all(visible.map(async (offer) => {
        const property = await ctx.db.get(offer.propertyId);
        let senderName = "غير معروف";
        if (offer.fromBrokerId) {
            const broker = await ctx.db.get(offer.fromBrokerId);
            if (broker) senderName = broker.name;
        } else if (offer.fromREDId) {
            const red = await ctx.db.get(offer.fromREDId);
            if (red) senderName = red.name;
        }
        return { ...offer, property, senderName };
    }));
}

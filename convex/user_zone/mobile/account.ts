import { ConvexError, v } from "convex/values";
import type { Doc, Id } from "../../_generated/dataModel";
import { api, internal } from "../../_generated/api";
import { mutation, query } from "../../_generated/server";
import { getAuthUserId } from "../../_core/security/authIdentity";
import {
  getLatestThreadPreview,
  listRecentThreads,
  listThreadMessages,
} from "../../ai_zone/services/assistantService";
import { buildBuyerComparisonSnapshot } from "../../shared_logic/buyerComparisons";
import {
  mobileAssistantResultCardValidator,
  mobileAssistantStateValidator,
  mobileBuyerConsentsValidator,
  mobileBuyerProfileValidator,
  mobileBuyerViewerValidator,
  mobileFinanceDefaultsPatchValidator,
  mobileGuestBuyerLocalStateValidator,
} from "./contracts";

const PUBLIC_ASSISTANT_KIND = "anan_main_public" as const;
const DEFAULT_THREAD_LIMIT = 12;
const DEFAULT_DISPLAY_NAME = "ضيف عنان";
const buyerComparisonsInternal = (internal as Record<string, any>)["shared_logic/buyerComparisons"];
const DEFAULT_FINANCE_DEFAULTS = {
  downPaymentPercent: 10,
  preferredYears: 20,
  annualRate: 4.75,
} as const;

type MobileBuyerAccountDoc = Doc<"mobileBuyerAccounts">;

function getBuyerOwner(userId: string) {
  return {
    userId,
    ownerType: "user" as const,
  };
}

function trimOptionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function readOptionalStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : undefined;
}

function readOptionalProperties(value: unknown) {
  return Array.isArray(value) ? value : undefined;
}

function readOptionalCards(value: unknown) {
  return Array.isArray(value) ? value : undefined;
}

function readOptionalPropertyIds(value: unknown) {
  return Array.isArray(value)
    ? value.filter((entry): entry is Id<"properties"> => typeof entry === "string")
    : undefined;
}

function isGuestPlaceholderName(value: string | undefined) {
  if (!value) return false;
  const normalized = value.trim().toLowerCase();
  return normalized === "ضيف عنان" || normalized === "anan guest" || normalized === "main assistant guest";
}

function mergeNewestTimestamp(current?: number, next?: number) {
  if (typeof current === "number" && typeof next === "number") {
    return Math.max(current, next);
  }
  return typeof current === "number" ? current : next;
}

function buildDefaultPreferences() {
  return {
    locale: "ar" as const,
    onboardingCompletedAt: undefined,
    authEntryDismissedAt: undefined,
    financeDefaults: {
      ...DEFAULT_FINANCE_DEFAULTS,
    },
  };
}

function buildDefaultAccountRecord(authUserId: string, now: number) {
  return {
    authUserId,
    profile: {},
    savedPropertyIds: [] as Array<Id<"properties">>,
    consents: {},
    preferences: buildDefaultPreferences(),
    createdAt: now,
    updatedAt: now,
  };
}

function resolveAccountState(account: MobileBuyerAccountDoc | null | undefined) {
  return {
    profile: {
      displayName: trimOptionalString(account?.profile?.displayName),
      phone: trimOptionalString(account?.profile?.phone),
      email: trimOptionalString(account?.profile?.email),
    },
    savedPropertyIds: (account?.savedPropertyIds ?? []).map((propertyId) => String(propertyId)),
    consents: {
      privacyAcceptedAt: account?.consents?.privacyAcceptedAt,
      termsAcceptedAt: account?.consents?.termsAcceptedAt,
      microphoneAcceptedAt: account?.consents?.microphoneAcceptedAt,
      supportAcceptedAt: account?.consents?.supportAcceptedAt,
    },
    preferences: {
      locale: account?.preferences?.locale ?? "ar",
      onboardingCompletedAt: account?.preferences?.onboardingCompletedAt,
      authEntryDismissedAt: account?.preferences?.authEntryDismissedAt,
      financeDefaults: {
        downPaymentPercent:
          account?.preferences?.financeDefaults?.downPaymentPercent ?? DEFAULT_FINANCE_DEFAULTS.downPaymentPercent,
        preferredYears:
          account?.preferences?.financeDefaults?.preferredYears ?? DEFAULT_FINANCE_DEFAULTS.preferredYears,
        annualRate: account?.preferences?.financeDefaults?.annualRate ?? DEFAULT_FINANCE_DEFAULTS.annualRate,
      },
    },
  };
}

function buildViewerPayload(args: {
  authUserId: string;
  profile: Doc<"userProfiles"> | null;
  authUser: Doc<"users"> | null;
  account: MobileBuyerAccountDoc | null;
  qualifiedOrdersCount: number;
}) {
  const accountState = resolveAccountState(args.account);
  return {
    id: args.authUser ? String(args.authUser._id) : undefined,
    authUserId: args.authUserId,
    displayName:
      accountState.profile.displayName ??
      args.profile?.name ??
      args.authUser?.displayName ??
      args.authUser?.name ??
      args.authUser?.email ??
      DEFAULT_DISPLAY_NAME,
    email: accountState.profile.email ?? args.profile?.email ?? args.authUser?.email ?? undefined,
    phone: accountState.profile.phone ?? args.authUser?.phone ?? undefined,
    role: args.profile?.role ?? "user",
    isAuthenticated: true,
    qualifiedOrdersCount: args.qualifiedOrdersCount,
    savedPropertyIds: accountState.savedPropertyIds,
    consents: accountState.consents,
    preferences: accountState.preferences,
  };
}

async function getMobileBuyerAccountByAuthUserId(ctx: any, authUserId: string) {
  return ctx.db.query("mobileBuyerAccounts").withIndex("authUserId", (q: any) => q.eq("authUserId", authUserId)).first();
}

async function ensureMobileBuyerAccount(ctx: any, authUserId: string) {
  const existing = await getMobileBuyerAccountByAuthUserId(ctx, authUserId);
  if (existing) return existing;

  const now = Date.now();
  const accountId = await ctx.db.insert("mobileBuyerAccounts", buildDefaultAccountRecord(authUserId, now));
  return (await ctx.db.get(accountId)) as MobileBuyerAccountDoc;
}

function normalizePropertyIds(ctx: any, propertyIds: string[]) {
  const uniquePropertyIds = Array.from(
    new Set(propertyIds.map((propertyId) => propertyId.trim()).filter((propertyId) => propertyId.length > 0)),
  );

  return uniquePropertyIds.flatMap((propertyId) => {
    const normalizedId = ctx.db.normalizeId("properties", propertyId);
    return normalizedId ? [normalizedId] : [];
  });
}

async function requireAuthenticatedBuyer(ctx: any) {
  const authUserId = await getAuthUserId(ctx);
  if (!authUserId) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Authentication required.",
    });
  }
  return authUserId;
}

function mapStoredMessage(message: {
  _id: string;
  role: "assistant" | "user";
  content: string;
  createdAt: number;
  metadata?: unknown;
}) {
  const metadata = (message.metadata ?? {}) as Record<string, unknown>;
  return {
    id: String(message._id),
    role: message.role,
    text: message.content,
    createdAt: message.createdAt,
    properties: readOptionalProperties(metadata.properties),
    cards: readOptionalCards(metadata.cards),
    activePropertyId: typeof metadata.activePropertyId === "string" ? metadata.activePropertyId : undefined,
    requiresAuthForHandoff:
      typeof metadata.requiresAuthForHandoff === "boolean" ? metadata.requiresAuthForHandoff : undefined,
    suggestedPrompts: readOptionalStringArray(metadata.suggestedPrompts),
    comparisonArtifactId:
      typeof metadata.comparisonArtifactId === "string"
        ? (metadata.comparisonArtifactId as Id<"buyerComparisonArtifacts">)
        : undefined,
    comparisonPropertyIds: readOptionalPropertyIds(metadata.comparisonPropertyIds),
    selectionSource:
      metadata.selectionSource === "ui_selected" ||
      metadata.selectionSource === "history_resolved" ||
      metadata.selectionSource === "text_resolved"
        ? (metadata.selectionSource as "ui_selected" | "history_resolved" | "text_resolved")
        : undefined,
  };
}

async function hydrateStoredMessages(args: {
  ctx: any;
  threadId?: Id<"assistantThreads">;
  messages: Array<{
    _id: string;
    role: "assistant" | "user";
    content: string;
    createdAt: number;
    metadata?: unknown;
  }>;
}) {
  const artifactCache = new Map<string, Promise<any>>();
  const propertyCache = new Map<string, Promise<any>>();

  const loadArtifact = async (artifactId: Id<"buyerComparisonArtifacts">) => {
    const key = String(artifactId);
    if (!artifactCache.has(key)) {
      artifactCache.set(
        key,
        args.ctx.runQuery(
          buyerComparisonsInternal.getBuyerComparisonArtifactInternal,
          {
            artifactId,
            threadId: args.threadId,
          },
        ),
      );
    }
    return artifactCache.get(key);
  };

  const loadProperty = async (propertyId: Id<"properties">) => {
    const key = String(propertyId);
    if (!propertyCache.has(key)) {
      propertyCache.set(
        key,
        args.ctx.runQuery(
          (api as any)["user_zone/web/properties"].getPropertyDetail,
          { propertyId },
        ),
      );
    }
    return propertyCache.get(key);
  };

  return Promise.all(
    args.messages.map(async (message) => {
      const mapped = mapStoredMessage(message);
      if (!mapped.comparisonArtifactId) return mapped;

      const artifact = await loadArtifact(mapped.comparisonArtifactId);
      if (!artifact) return mapped;

      const liveProperties = await Promise.all(
        (artifact.propertyIds as Array<Id<"properties">>).map((propertyId) => loadProperty(propertyId)),
      );
      const snapshot =
        liveProperties.every(Boolean) && liveProperties.length >= 2
          ? buildBuyerComparisonSnapshot({
              locale: artifact.locale,
              properties: liveProperties as any,
              selectionSource: artifact.selectionSource,
            }).snapshot
          : artifact.snapshot;

      return {
        ...mapped,
        text: snapshot.message,
        properties: snapshot.properties,
        cards: snapshot.cards,
        activePropertyId: snapshot.activePropertyId,
        suggestedPrompts: snapshot.suggestedPrompts,
      };
    }),
  );
}

async function buildThreadSummaries(
  ctx: any,
  authUserId: string,
  limit: number,
) {
  const threads = await listRecentThreads(
    ctx,
    getBuyerOwner(authUserId),
    PUBLIC_ASSISTANT_KIND,
    limit,
  );

  return Promise.all(
    threads.map(async (thread) => ({
      id: String(thread._id),
      title: thread.title?.trim() || "Buyer conversation",
      createdAt: thread.createdAt,
      updatedAt: thread.updatedAt,
      preview: await getLatestThreadPreview(ctx, thread._id),
    })),
  );
}

/**
 * WHY:   Signed-in mobile screens need one merged buyer-account payload instead of stitching identity and mobile preferences client-side.
 * WHAT:  Returns the authenticated buyer viewer including backend-backed saved properties, consents, and preferences.
 * HOW:   Joins the auth user, profile, orders, and dedicated mobile account record while leaving `userProfiles` read-only.
 */
export const getAccount = query({
  args: {},
  returns: v.union(mobileBuyerViewerValidator, v.null()),
  handler: async (ctx, _args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;

    const [profile, orders, account] = await Promise.all([
      ctx.db.query("userProfiles").withIndex("authUserId", (q) => q.eq("authUserId", authUserId)).first(),
      ctx.db.query("orders").withIndex("userId", (q) => q.eq("userId", authUserId)).collect(),
      getMobileBuyerAccountByAuthUserId(ctx, authUserId),
    ]);

    const normalizedUserId = ctx.db.normalizeId("users", authUserId);
    const authUser = normalizedUserId ? await ctx.db.get(normalizedUserId) : null;
    const qualifiedOrdersCount = orders.filter((order) =>
      order.status === "qualified" ||
      order.status === "offer_made" ||
      order.status === "under_contract" ||
      order.status === "closed_won",
    ).length;

    return buildViewerPayload({
      authUserId,
      profile,
      authUser,
      account,
      qualifiedOrdersCount,
    });
  },
});

/**
 * WHY:   The mobile history and account routes need authenticated assistant continuity from the shared public thread store.
 * WHAT:  Returns recent saved public-assistant threads plus the active transcript for the selected thread.
 * HOW:   Reuses the existing `anan_main_public` assistantThreads and assistantMessages store for the signed-in buyer owner.
 */
export const getAssistantState = query({
  args: {
    threadId: v.optional(v.id("assistantThreads")),
    limit: v.optional(v.number()),
  },
  returns: mobileAssistantStateValidator,
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      return {
        activeThreadId: undefined,
        recentThreads: [],
        activeMessages: [],
      };
    }

    const recentThreads = await buildThreadSummaries(ctx, authUserId, args.limit ?? DEFAULT_THREAD_LIMIT);
    const fallbackThreadId = recentThreads[0]?.id;
    const resolvedThreadId = args.threadId ?? ctx.db.normalizeId("assistantThreads", fallbackThreadId ?? "");
    const activeMessages = resolvedThreadId
      ? await listThreadMessages(
          ctx,
          getBuyerOwner(authUserId),
          resolvedThreadId,
          PUBLIC_ASSISTANT_KIND,
        )
      : [];

    return {
      activeThreadId: resolvedThreadId ? String(resolvedThreadId) : fallbackThreadId,
      recentThreads,
      activeMessages: await hydrateStoredMessages({
        ctx,
        threadId: resolvedThreadId ?? undefined,
        messages: activeMessages as any,
      }),
    };
  },
});

/**
 * WHY:   Signed-in mobile buyers should edit profile/contact details through the backend-owned mobile account record.
 * WHAT:  Updates the buyer's mobile profile overrides for display name, phone, and email.
 * HOW:   Creates the account record on first write, trims incoming values, and patches only the provided fields.
 */
export const updateProfile = mutation({
  args: {
    profile: mobileBuyerProfileValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthenticatedBuyer(ctx);
    const account = await ensureMobileBuyerAccount(ctx, authUserId);
    const now = Date.now();

    await ctx.db.patch(account._id, {
      profile: {
        displayName: trimOptionalString(args.profile.displayName) ?? account.profile.displayName,
        phone: trimOptionalString(args.profile.phone) ?? account.profile.phone,
        email: trimOptionalString(args.profile.email) ?? account.profile.email,
      },
      updatedAt: now,
    });

    return null;
  },
});

/**
 * WHY:   Saved-property actions on mobile must survive app reinstalls and sync across signed-in sessions.
 * WHAT:  Toggles one property id inside the authenticated buyer's backend mobile account record.
 * HOW:   Normalizes the property id against Convex ids, then inserts or removes it from the dedicated saved-id list.
 */
export const toggleSavedProperty = mutation({
  args: {
    propertyId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthenticatedBuyer(ctx);
    const normalizedPropertyId = ctx.db.normalizeId("properties", args.propertyId.trim());
    if (!normalizedPropertyId) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Property not found.",
      });
    }

    const account = await ensureMobileBuyerAccount(ctx, authUserId);
    const existingIds = account.savedPropertyIds.map((propertyId: Id<"properties">) => String(propertyId));
    const nextSavedIds = existingIds.includes(String(normalizedPropertyId))
      ? account.savedPropertyIds.filter(
          (propertyId: Id<"properties">) => String(propertyId) !== String(normalizedPropertyId),
        )
      : [normalizedPropertyId, ...account.savedPropertyIds];

    await ctx.db.patch(account._id, {
      savedPropertyIds: nextSavedIds,
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * WHY:   Mobile consent banners and legal checkpoints need a durable signed-in source of truth.
 * WHAT:  Merges the provided consent timestamps into the authenticated mobile account record.
 * HOW:   Preserves the newest timestamp per consent key so guest-to-auth promotion stays deterministic.
 */
export const updateConsents = mutation({
  args: {
    consents: mobileBuyerConsentsValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthenticatedBuyer(ctx);
    const account = await ensureMobileBuyerAccount(ctx, authUserId);

    await ctx.db.patch(account._id, {
      consents: {
        privacyAcceptedAt: mergeNewestTimestamp(account.consents.privacyAcceptedAt, args.consents.privacyAcceptedAt),
        termsAcceptedAt: mergeNewestTimestamp(account.consents.termsAcceptedAt, args.consents.termsAcceptedAt),
        microphoneAcceptedAt: mergeNewestTimestamp(
          account.consents.microphoneAcceptedAt,
          args.consents.microphoneAcceptedAt,
        ),
        supportAcceptedAt: mergeNewestTimestamp(account.consents.supportAcceptedAt, args.consents.supportAcceptedAt),
      },
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * WHY:   Signed-in mobile buyers need backend persistence for locale, onboarding, auth-entry, and finance defaults.
 * WHAT:  Applies a partial preferences update to the dedicated mobile buyer account record.
 * HOW:   Merges the incoming patch over the stored preferences while allowing auth-entry dismissal to be cleared explicitly.
 */
export const updatePreferences = mutation({
  args: {
    locale: v.optional(v.union(v.literal("ar"), v.literal("en"))),
    onboardingCompletedAt: v.optional(v.number()),
    authEntryDismissedAt: v.optional(v.union(v.number(), v.null())),
    financeDefaults: v.optional(mobileFinanceDefaultsPatchValidator),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthenticatedBuyer(ctx);
    const account = await ensureMobileBuyerAccount(ctx, authUserId);
    const currentPreferences = resolveAccountState(account).preferences;

    await ctx.db.patch(account._id, {
      preferences: {
        locale: args.locale ?? currentPreferences.locale,
        onboardingCompletedAt: args.onboardingCompletedAt ?? currentPreferences.onboardingCompletedAt,
        authEntryDismissedAt:
          args.authEntryDismissedAt === null
            ? undefined
            : args.authEntryDismissedAt ?? currentPreferences.authEntryDismissedAt,
        financeDefaults: {
          downPaymentPercent:
            args.financeDefaults?.downPaymentPercent ?? currentPreferences.financeDefaults.downPaymentPercent,
          preferredYears: args.financeDefaults?.preferredYears ?? currentPreferences.financeDefaults.preferredYears,
          annualRate: args.financeDefaults?.annualRate ?? currentPreferences.financeDefaults.annualRate,
        },
      },
      updatedAt: Date.now(),
    });

    return null;
  },
});

/**
 * WHY:   The first signed-in mobile session should inherit guest-saved items and preferences without leaking guest-only placeholders.
 * WHAT:  Merges the locally persisted guest mobile account state into the authenticated backend account record.
 * HOW:   Unions saved-property ids, keeps newest consent timestamps, uses local preferences as bootstrap defaults, and only copies meaningful guest profile values into empty backend overrides.
 */
export const mergeGuestLocalState = mutation({
  args: {
    state: mobileGuestBuyerLocalStateValidator,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const authUserId = await requireAuthenticatedBuyer(ctx);
    const account = await ensureMobileBuyerAccount(ctx, authUserId);
    const now = Date.now();
    const currentState = resolveAccountState(account);
    const localSavedPropertyIds = normalizePropertyIds(ctx, args.state.savedPropertyIds);

    const mergedSavedPropertyIds = Array.from(
      new Map(
        [...account.savedPropertyIds, ...localSavedPropertyIds].map((propertyId) => [String(propertyId), propertyId]),
      ).values(),
    );

    const nextDisplayName = trimOptionalString(args.state.profile.displayName);
    const nextPhone = trimOptionalString(args.state.profile.phone);
    const nextEmail = trimOptionalString(args.state.profile.email);
    const shouldUseLocalBootstrap = account.createdAt === account.updatedAt && account.savedPropertyIds.length === 0;

    await ctx.db.patch(account._id, {
      profile: {
        displayName:
          currentState.profile.displayName ??
          (nextDisplayName && !isGuestPlaceholderName(nextDisplayName) ? nextDisplayName : undefined),
        phone: currentState.profile.phone ?? nextPhone,
        email: currentState.profile.email ?? nextEmail,
      },
      savedPropertyIds: mergedSavedPropertyIds,
      consents: {
        privacyAcceptedAt: mergeNewestTimestamp(
          currentState.consents.privacyAcceptedAt,
          args.state.consents.privacyAcceptedAt,
        ),
        termsAcceptedAt: mergeNewestTimestamp(currentState.consents.termsAcceptedAt, args.state.consents.termsAcceptedAt),
        microphoneAcceptedAt: mergeNewestTimestamp(
          currentState.consents.microphoneAcceptedAt,
          args.state.consents.microphoneAcceptedAt,
        ),
        supportAcceptedAt: mergeNewestTimestamp(
          currentState.consents.supportAcceptedAt,
          args.state.consents.supportAcceptedAt,
        ),
      },
      preferences: {
        locale: shouldUseLocalBootstrap ? args.state.preferences.locale : currentState.preferences.locale,
        onboardingCompletedAt:
          currentState.preferences.onboardingCompletedAt ?? args.state.preferences.onboardingCompletedAt,
        authEntryDismissedAt:
          currentState.preferences.authEntryDismissedAt ?? args.state.preferences.authEntryDismissedAt,
        financeDefaults: {
          downPaymentPercent: shouldUseLocalBootstrap
            ? args.state.preferences.financeDefaults.downPaymentPercent
            : currentState.preferences.financeDefaults.downPaymentPercent,
          preferredYears: shouldUseLocalBootstrap
            ? args.state.preferences.financeDefaults.preferredYears
            : currentState.preferences.financeDefaults.preferredYears,
          annualRate: shouldUseLocalBootstrap
            ? args.state.preferences.financeDefaults.annualRate
            : currentState.preferences.financeDefaults.annualRate,
        },
      },
      updatedAt: now,
    });

    return null;
  },
});

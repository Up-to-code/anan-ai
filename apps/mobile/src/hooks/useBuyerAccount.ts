import { useMutation, useQuery } from "convex/react";
import { createContext, createElement, useContext, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@/lib/convexApi";
import { authClient } from "@/lib/auth-client";
import {
  clearBuyerLocalState,
  emptyBuyerLocalState,
  loadBuyerLocalState,
  saveBuyerLocalState,
} from "@/lib/mobileBuyerAccount";
import {
  clearGuestAssistantSession,
  loadGuestAssistantSession,
} from "@/lib/mobileAssistantSession";
import { resolveBuyerLaunchRoute } from "@/lib/mobileAuthRouting";
import { clearGuestThreadStore, loadGuestThreadStore } from "@/lib/mobilePersistence";
import { listThreadSummaries } from "@/lib/mobileThreadStore";
import { resolveConvexUrl } from "@/lib/mobileEnv.shared";
import type {
  MobileBuyerConsents,
  MobileBuyerLocalState,
  MobileBuyerPreferences,
  MobileBuyerViewer,
  MobileBuyerViewerIdentity,
  MobileBuyerViewerState,
  MobileFinanceDefaults,
  MobileThreadSummary,
} from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(
  resolveConvexUrl({
    expoPublicConvexUrl: process.env.EXPO_PUBLIC_CONVEX_URL,
  }),
);

type BuyerAccountValue = ReturnType<typeof useBuyerAccountController>;

type MobileAssistantState = {
  activeThreadId?: string;
  recentThreads: MobileThreadSummary[];
  activeMessages: Array<unknown>;
};

const BuyerAccountContext = createContext<BuyerAccountValue | null>(null);

function trimOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function toLocalState(viewer: MobileBuyerViewerState): MobileBuyerLocalState {
  return {
    version: 2,
    profile: {
      displayName: viewer.displayName,
      phone: viewer.phone,
      email: viewer.email,
    },
    savedPropertyIds: viewer.savedPropertyIds,
    consents: viewer.consents,
    preferences: viewer.preferences,
  };
}

function isMeaningfulGuestData(state: MobileBuyerLocalState) {
  return (
    state.savedPropertyIds.length > 0 ||
    Boolean(state.profile.phone) ||
    Boolean(state.profile.email) ||
    (state.profile.displayName.trim().length > 0 && state.profile.displayName !== "ضيف عنان") ||
    Object.values(state.consents).some((value) => typeof value === "number") ||
    state.preferences.locale !== "ar" ||
    typeof state.preferences.onboardingCompletedAt === "number" ||
    typeof state.preferences.authEntryDismissedAt === "number" ||
    state.preferences.financeDefaults.downPaymentPercent !== 10 ||
    state.preferences.financeDefaults.preferredYears !== 20 ||
    state.preferences.financeDefaults.annualRate !== 4.75
  );
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type BuyerPreferencesPatch = Partial<Omit<MobileBuyerPreferences, "financeDefaults">> & {
  financeDefaults?: Partial<MobileFinanceDefaults>;
};

function useLiveBuyerViewer(enabled: boolean) {
  return useQuery(api.user_zone.mobile.viewer.getViewer, enabled ? ({} as never) : "skip") as
    | MobileBuyerViewerState
    | null
    | undefined;
}

function useLiveAssistantState(enabled: boolean) {
  return useQuery(api.user_zone.mobile.account.getAssistantState, enabled ? ({} as never) : "skip") as
    | MobileAssistantState
    | undefined;
}

function useLiveAccountMutations() {
  return {
    updateProfile: useMutation(api.user_zone.mobile.account.updateProfile),
    toggleSavedProperty: useMutation(api.user_zone.mobile.account.toggleSavedProperty),
    updateConsents: useMutation(api.user_zone.mobile.account.updateConsents),
    updatePreferences: useMutation(api.user_zone.mobile.account.updatePreferences),
    mergeGuestLocalState: useMutation(api.user_zone.mobile.account.mergeGuestLocalState),
    promoteGuestToAuthenticatedBuyer: useMutation(api.ai_zone.assistantPublic.promoteGuestToAuthenticatedBuyer),
  };
}

function useBuyerAccountController() {
  const { data: session, isPending: isAuthPending } = authClient.useSession();
  const isSignedIn = Boolean(session?.session);
  const user = session?.user ?? null;
  const liveViewer = LIVE_BACKEND_ENABLED ? useLiveBuyerViewer(Boolean(isSignedIn)) : null;
  const liveAssistantState = LIVE_BACKEND_ENABLED ? useLiveAssistantState(Boolean(isSignedIn)) : null;
  const liveMutations = LIVE_BACKEND_ENABLED ? useLiveAccountMutations() : null;
  const [localState, setLocalState] = useState<MobileBuyerLocalState>(emptyBuyerLocalState());
  const [guestRecentThreads, setGuestRecentThreads] = useState<MobileThreadSummary[]>([]);
  const [guestActiveThreadId, setGuestActiveThreadId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [hasAuthShadow, setHasAuthShadow] = useState(false);
  const previousSignedInRef = useRef(false);

  async function hydrateGuestArtifacts() {
    const [nextState, threadStore] = await Promise.all([loadBuyerLocalState(), loadGuestThreadStore()]);
    setLocalState(nextState);
    setGuestRecentThreads(listThreadSummaries(threadStore));
    setGuestActiveThreadId(threadStore.activeThreadId);
  }

  useEffect(() => {
    void hydrateGuestArtifacts().then(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const wasSignedIn = previousSignedInRef.current;
    previousSignedInRef.current = Boolean(isSignedIn);

    if (!isSignedIn && wasSignedIn) {
      setHasAuthShadow(false);
      void hydrateGuestArtifacts();
    }
  }, [isHydrated, isSignedIn]);

  const authIdentity = useMemo<MobileBuyerViewerIdentity | null>(() => {
    if (!isSignedIn || !user) return null;

    return {
      id: user.id,
      authUserId: user.id,
      displayName: user.name?.trim() || user.email || "عميل عنان",
      email: user.email ?? undefined,
      imageUrl: user.image ?? undefined,
      role: "user",
      isAuthenticated: true,
      qualifiedOrdersCount: 0,
    };
  }, [isSignedIn, user]);

  useEffect(() => {
    if (!isHydrated || !liveViewer?.isAuthenticated) return;
    setLocalState(toLocalState(liveViewer));
    setHasAuthShadow(true);
  }, [isHydrated, liveViewer]);

  const accountState = useMemo(() => {
    if (liveViewer?.isAuthenticated) {
      return hasAuthShadow ? localState : toLocalState(liveViewer);
    }
    return localState;
  }, [hasAuthShadow, liveViewer, localState]);

  const isAuthenticatedMode = Boolean(liveViewer?.isAuthenticated);
  const recentThreads = isAuthenticatedMode ? liveAssistantState?.recentThreads ?? [] : guestRecentThreads;
  const activeThreadId = isAuthenticatedMode ? liveAssistantState?.activeThreadId ?? null : guestActiveThreadId;

  async function withGuestPersistence(nextState: MobileBuyerLocalState) {
    setLocalState(nextState);
    await saveBuyerLocalState(nextState);
  }

  async function withAuthenticatedShadow(
    updater: (current: MobileBuyerLocalState) => MobileBuyerLocalState,
    task: () => Promise<unknown>,
  ) {
    const previousState = accountState;
    const nextState = updater(previousState);
    setLocalState(nextState);
    setHasAuthShadow(true);

    try {
      await task();
    } catch (error) {
      setLocalState(previousState);
      throw error;
    }
  }

  async function updateProfile(profile: Partial<MobileBuyerLocalState["profile"]>) {
    const updater = (current: MobileBuyerLocalState) => ({
      ...current,
      profile: {
        displayName: trimOptionalString(profile.displayName) || current.profile.displayName,
        phone: trimOptionalString(profile.phone) || current.profile.phone,
        email: trimOptionalString(profile.email) || current.profile.email,
      },
    });

    if (isAuthenticatedMode && liveMutations) {
      await withAuthenticatedShadow(updater, () =>
        liveMutations.updateProfile({
          profile: {
            displayName: trimOptionalString(profile.displayName),
            phone: trimOptionalString(profile.phone),
            email: trimOptionalString(profile.email),
          },
        } as never),
      );
      return;
    }

    await withGuestPersistence(updater(localState));
  }

  async function toggleSavedProperty(propertyId: string) {
    const trimmedId = propertyId.trim();
    if (!trimmedId) return;

    const updater = (current: MobileBuyerLocalState) => {
      const exists = current.savedPropertyIds.includes(trimmedId);
      return {
        ...current,
        savedPropertyIds: exists
          ? current.savedPropertyIds.filter((candidate) => candidate !== trimmedId)
          : [trimmedId, ...current.savedPropertyIds],
      };
    };

    if (isAuthenticatedMode && liveMutations) {
      await withAuthenticatedShadow(updater, () =>
        liveMutations.toggleSavedProperty({
          propertyId: trimmedId,
        } as never),
      );
      return;
    }

    await withGuestPersistence(updater(localState));
  }

  async function setConsent<K extends keyof MobileBuyerConsents>(key: K, acceptedAt = Date.now()) {
    const updater = (current: MobileBuyerLocalState) => ({
      ...current,
      consents: {
        ...current.consents,
        [key]: acceptedAt,
      },
    });

    if (isAuthenticatedMode && liveMutations) {
      await withAuthenticatedShadow(updater, () =>
        liveMutations.updateConsents({
          consents: {
            [key]: acceptedAt,
          },
        } as never),
      );
      return;
    }

    await withGuestPersistence(updater(localState));
  }

  async function updatePreferences(preferences: BuyerPreferencesPatch) {
    const updater = (current: MobileBuyerLocalState) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...preferences,
        financeDefaults: {
          ...current.preferences.financeDefaults,
          ...preferences.financeDefaults,
        },
      },
    });

    if (isAuthenticatedMode && liveMutations) {
      const hasAuthEntryDismissedAt = Object.prototype.hasOwnProperty.call(preferences, "authEntryDismissedAt");
      await withAuthenticatedShadow(updater, () =>
        liveMutations.updatePreferences({
          ...(preferences.locale ? { locale: preferences.locale } : {}),
          ...(typeof preferences.onboardingCompletedAt === "number"
            ? { onboardingCompletedAt: preferences.onboardingCompletedAt }
            : {}),
          ...(hasAuthEntryDismissedAt
            ? {
                authEntryDismissedAt:
                  typeof preferences.authEntryDismissedAt === "number" ? preferences.authEntryDismissedAt : null,
              }
            : {}),
          ...(preferences.financeDefaults ? { financeDefaults: preferences.financeDefaults } : {}),
        } as never),
      );
      return;
    }

    await withGuestPersistence(updater(localState));
  }

  async function updateFinanceDefaults(financeDefaults: Partial<MobileFinanceDefaults>) {
    await updatePreferences({
      financeDefaults,
    });
  }

  async function markOnboardingCompleted() {
    await updatePreferences({
      onboardingCompletedAt: accountState.preferences.onboardingCompletedAt ?? Date.now(),
    });
  }

  async function dismissAuthEntry(dismissedAt = Date.now()) {
    await updatePreferences({
      authEntryDismissedAt: dismissedAt,
    });
  }

  async function restoreAuthEntry() {
    await updatePreferences({
      authEntryDismissedAt: undefined,
    });
  }

  async function refreshThreads() {
    if (isAuthenticatedMode) return;
    const threadStore = await loadGuestThreadStore();
    setGuestRecentThreads(listThreadSummaries(threadStore));
    setGuestActiveThreadId(threadStore.activeThreadId);
  }

  async function resetLocalBuyerState() {
    await Promise.all([clearBuyerLocalState(), clearGuestThreadStore(), clearGuestAssistantSession()]);
    setLocalState(emptyBuyerLocalState());
    setGuestRecentThreads([]);
    setGuestActiveThreadId(null);
    setHasAuthShadow(false);
  }

  async function runWithAuthRetry(task: () => Promise<unknown>) {
    let lastError: unknown = null;
    for (let attempt = 0; attempt < 4; attempt += 1) {
      try {
        return await task();
      } catch (error) {
        lastError = error;
        await sleep(150 * (attempt + 1));
      }
    }
    throw lastError;
  }

  async function promoteGuestStateAfterAuth() {
    if (!LIVE_BACKEND_ENABLED || !liveMutations) return;

    const [guestState, guestSession] = await Promise.all([
      loadBuyerLocalState(),
      loadGuestAssistantSession(),
    ]);

    const shouldMergeLocalState = isMeaningfulGuestData(guestState);

    if (!shouldMergeLocalState && !guestSession?.guestId) {
      return;
    }

    if (guestSession?.guestId && guestSession.channelSessionToken) {
      await runWithAuthRetry(() =>
        liveMutations.promoteGuestToAuthenticatedBuyer({
          guestId: guestSession.guestId,
          channelSessionToken: guestSession.channelSessionToken,
        } as never),
      );
    }

    if (shouldMergeLocalState) {
      await runWithAuthRetry(() =>
        liveMutations.mergeGuestLocalState({
          state: guestState,
        } as never),
      );
    }

    await Promise.all([clearBuyerLocalState(), clearGuestThreadStore(), clearGuestAssistantSession()]);
    setLocalState(emptyBuyerLocalState());
    setGuestRecentThreads([]);
    setGuestActiveThreadId(null);
  }

  const viewer = useMemo<MobileBuyerViewer>(() => {
    const identity =
      liveViewer && liveViewer.isAuthenticated
        ? liveViewer
        : authIdentity ?? {
            displayName: accountState.profile.displayName,
            phone: accountState.profile.phone,
            email: accountState.profile.email,
            role: "guest" as const,
            isAuthenticated: false,
            qualifiedOrdersCount: 0,
          };

    return {
      ...identity,
      sessionMode: identity.isAuthenticated ? "identified" : "guest",
      activeThreadId,
      threadCount: recentThreads.length,
      savedPropertyIds: accountState.savedPropertyIds,
      consents: accountState.consents,
      preferences: accountState.preferences,
    };
  }, [accountState, activeThreadId, authIdentity, liveViewer, recentThreads.length]);

  const isViewerReady = !LIVE_BACKEND_ENABLED || !isSignedIn || (liveViewer !== undefined && liveAssistantState !== undefined);
  const resolvedLaunchRoute = resolveBuyerLaunchRoute({
    isAuthenticated: viewer.isAuthenticated,
    authEntryDismissedAt: viewer.preferences.authEntryDismissedAt,
    isOnboardingComplete: Boolean(viewer.preferences.onboardingCompletedAt),
  });

  return {
    isHydrated: isHydrated && !isAuthPending && isViewerReady,
    localState,
    viewer,
    authSources: {
      auth: authIdentity,
      convex: liveViewer,
    },
    recentThreads,
    isOnboardingComplete: Boolean(viewer.preferences.onboardingCompletedAt),
    shouldShowAuthEntry: resolvedLaunchRoute === "/auth",
    launchRoute: resolvedLaunchRoute,
    isPropertySaved(propertyId?: string | null) {
      if (!propertyId) return false;
      return viewer.savedPropertyIds.includes(propertyId);
    },
    updateProfile,
    toggleSavedProperty,
    setConsent,
    markOnboardingCompleted,
    updateFinanceDefaults,
    updatePreferences,
    dismissAuthEntry,
    restoreAuthEntry,
    refreshThreads,
    resetLocalBuyerState,
    promoteGuestStateAfterAuth,
  };
}

/**
 * WHY:   Buyer state is now shared by locale, navigation, and every mobile screen.
 * WHAT:  Provides a single buyer-account source of truth for the mobile app tree.
 * HOW:   Wraps the existing buyer-account controller in context so locale updates and account edits stay reactive everywhere.
 */
export function BuyerAccountProvider({ children }: { children: React.ReactNode }) {
  const value = useBuyerAccountController();
  return createElement(BuyerAccountContext.Provider, { value }, children);
}

/**
 * WHY:   Mobile screens need one stable, reactive account contract instead of each hydrating their own copy.
 * WHAT:  Returns the shared buyer-account state and actions from context.
 * HOW:   Falls back with a clear error when mounted outside the provider so setup issues fail loudly during development.
 */
export function useBuyerAccount() {
  const context = useContext(BuyerAccountContext);
  if (!context) {
    throw new Error("useBuyerAccount must be used within BuyerAccountProvider");
  }
  return context;
}

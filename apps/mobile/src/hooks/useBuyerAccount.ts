import { useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/lib/convexApi";
import {
  clearBuyerLocalState,
  emptyBuyerLocalState,
  loadBuyerLocalState,
  saveBuyerLocalState,
} from "@/lib/mobileBuyerAccount";
import { clearGuestThreadStore, loadGuestThreadStore } from "@/lib/mobilePersistence";
import { listThreadSummaries } from "@/lib/mobileThreadStore";
import type {
  MobileBuyerConsents,
  MobileBuyerLocalState,
  MobileBuyerPreferences,
  MobileBuyerViewer,
  MobileBuyerViewerIdentity,
  MobileFinanceDefaults,
  MobileThreadSummary,
} from "@/types/mobile";

const LIVE_BACKEND_ENABLED = Boolean(process.env.EXPO_PUBLIC_CONVEX_URL);

function useLiveBuyerViewer() {
  return useQuery(api.user_zone.mobile.viewer.getViewer, {} as never) as MobileBuyerViewerIdentity | null | undefined;
}

/**
 * WHY:   Buyer routes need one shared source of truth for onboarding state, saved properties, recent local history, and any live signed-in identity.
 * WHAT:  Hydrates the merged buyer account model used by welcome, account, finance, legal, and saved-property flows.
 * HOW:   Combines local device persistence with an optional live viewer query so the same screens stay coherent in both backend and fallback modes.
 */
export function useBuyerAccount() {
  const liveViewer = LIVE_BACKEND_ENABLED ? useLiveBuyerViewer() : null;
  const [localState, setLocalState] = useState<MobileBuyerLocalState>(emptyBuyerLocalState());
  const [recentThreads, setRecentThreads] = useState<MobileThreadSummary[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    void Promise.all([loadBuyerLocalState(), loadGuestThreadStore()]).then(([nextState, threadStore]) => {
      setLocalState(nextState);
      setRecentThreads(listThreadSummaries(threadStore));
      setActiveThreadId(threadStore.activeThreadId);
      setIsHydrated(true);
    });
  }, []);

  useEffect(() => {
    if (!isHydrated || !liveViewer?.isAuthenticated) return;

    const nextDisplayName = liveViewer.displayName?.trim();
    const nextPhone = liveViewer.phone?.trim();
    const nextEmail = liveViewer.email?.trim();

    setLocalState((current) => {
      const hasProfileDelta =
        (nextDisplayName && nextDisplayName !== current.profile.displayName) ||
        (nextPhone && nextPhone !== current.profile.phone) ||
        (nextEmail && nextEmail !== current.profile.email);

      if (!hasProfileDelta) return current;

      const merged = {
        ...current,
        profile: {
          displayName: nextDisplayName || current.profile.displayName,
          phone: nextPhone || current.profile.phone,
          email: nextEmail || current.profile.email,
        },
      };
      void saveBuyerLocalState(merged);
      return merged;
    });
  }, [isHydrated, liveViewer]);

  async function updateLocalState(updater: (current: MobileBuyerLocalState) => MobileBuyerLocalState) {
    setLocalState((current) => {
      const nextState = updater(current);
      void saveBuyerLocalState(nextState);
      return nextState;
    });
  }

  async function updateProfile(profile: Partial<MobileBuyerLocalState["profile"]>) {
    await updateLocalState((current) => ({
      ...current,
      profile: {
        displayName: profile.displayName?.trim() || current.profile.displayName,
        phone: profile.phone?.trim() || current.profile.phone,
        email: profile.email?.trim() || current.profile.email,
      },
    }));
  }

  async function toggleSavedProperty(propertyId: string) {
    const trimmedId = propertyId.trim();
    if (!trimmedId) return;
    await updateLocalState((current) => {
      const exists = current.savedPropertyIds.includes(trimmedId);
      return {
        ...current,
        savedPropertyIds: exists
          ? current.savedPropertyIds.filter((candidate) => candidate !== trimmedId)
          : [trimmedId, ...current.savedPropertyIds],
      };
    });
  }

  async function setConsent<K extends keyof MobileBuyerConsents>(key: K, acceptedAt = Date.now()) {
    await updateLocalState((current) => ({
      ...current,
      consents: {
        ...current.consents,
        [key]: acceptedAt,
      },
    }));
  }

  async function markOnboardingCompleted() {
    await updateLocalState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        onboardingCompletedAt: current.preferences.onboardingCompletedAt ?? Date.now(),
      },
    }));
  }

  async function updateFinanceDefaults(financeDefaults: Partial<MobileFinanceDefaults>) {
    await updateLocalState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        financeDefaults: {
          ...current.preferences.financeDefaults,
          ...financeDefaults,
        },
      },
    }));
  }

  async function updatePreferences(preferences: Partial<MobileBuyerPreferences>) {
    await updateLocalState((current) => ({
      ...current,
      preferences: {
        ...current.preferences,
        ...preferences,
        financeDefaults: {
          ...current.preferences.financeDefaults,
          ...preferences.financeDefaults,
        },
      },
    }));
  }

  async function refreshThreads() {
    const threadStore = await loadGuestThreadStore();
    setRecentThreads(listThreadSummaries(threadStore));
    setActiveThreadId(threadStore.activeThreadId);
  }

  async function resetLocalBuyerState() {
    await Promise.all([clearBuyerLocalState(), clearGuestThreadStore()]);
    setLocalState(emptyBuyerLocalState());
    setRecentThreads([]);
    setActiveThreadId(null);
  }

  const viewer = useMemo<MobileBuyerViewer>(() => {
    const identity = liveViewer && liveViewer.isAuthenticated
      ? liveViewer
      : {
          displayName: localState.profile.displayName,
          phone: localState.profile.phone,
          email: localState.profile.email,
          role: "guest" as const,
          isAuthenticated: false,
          qualifiedOrdersCount: 0,
        };

    return {
      ...identity,
      hasBackend: LIVE_BACKEND_ENABLED,
      sessionMode: identity.isAuthenticated ? "identified" : "guest",
      activeThreadId,
      threadCount: recentThreads.length,
      savedPropertyIds: localState.savedPropertyIds,
      consents: localState.consents,
      preferences: localState.preferences,
    };
  }, [activeThreadId, liveViewer, localState, recentThreads.length]);

  return {
    isHydrated,
    localState,
    viewer,
    recentThreads,
    isOnboardingComplete: Boolean(localState.preferences.onboardingCompletedAt),
    isPropertySaved(propertyId?: string | null) {
      if (!propertyId) return false;
      return localState.savedPropertyIds.includes(propertyId);
    },
    updateProfile,
    toggleSavedProperty,
    setConsent,
    markOnboardingCompleted,
    updateFinanceDefaults,
    updatePreferences,
    refreshThreads,
    resetLocalBuyerState,
  };
}


import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import type {
  MobileBuyerConsents,
  MobileBuyerLocalState,
  MobileBuyerPreferences,
  MobileBuyerProfile,
} from "@/types/mobile";

const WEB_BUYER_ACCOUNT_KEY = "anan-mobile:buyer-account";

const DEFAULT_PROFILE: MobileBuyerProfile = {
  displayName: "ضيف عنان",
};

const DEFAULT_PREFERENCES: MobileBuyerPreferences = {
  locale: "ar",
  financeDefaults: {
    downPaymentPercent: 10,
    preferredYears: 20,
    annualRate: 4.75,
  },
};

const DEFAULT_CONSENTS: MobileBuyerConsents = {};

const EMPTY_BUYER_LOCAL_STATE: MobileBuyerLocalState = {
  version: 1,
  profile: DEFAULT_PROFILE,
  savedPropertyIds: [],
  consents: DEFAULT_CONSENTS,
  preferences: DEFAULT_PREFERENCES,
};

function getNativeStorageHandle() {
  if (Platform.OS === "web") return null;

  const directory = new Directory(Paths.document, "anan-mobile");
  const file = new File(directory, "buyer-account.json");
  return { directory, file };
}

function ensureNativeStorage(handle: NonNullable<ReturnType<typeof getNativeStorageHandle>>) {
  if (!handle.directory.exists) {
    handle.directory.create();
  }
  if (!handle.file.exists) {
    handle.file.create();
  }
}

function normalizeBuyerLocalState(value: unknown): MobileBuyerLocalState {
  if (!value || typeof value !== "object") return EMPTY_BUYER_LOCAL_STATE;

  const record = value as Partial<MobileBuyerLocalState>;
  const savedPropertyIds = Array.isArray(record.savedPropertyIds)
    ? Array.from(
        new Set(
          record.savedPropertyIds.filter((propertyId): propertyId is string => typeof propertyId === "string" && propertyId.trim().length > 0),
        ),
      )
    : [];

  return {
    version: 1,
    profile: {
      displayName:
        typeof record.profile?.displayName === "string" && record.profile.displayName.trim()
          ? record.profile.displayName.trim()
          : DEFAULT_PROFILE.displayName,
      phone: typeof record.profile?.phone === "string" && record.profile.phone.trim() ? record.profile.phone.trim() : undefined,
      email: typeof record.profile?.email === "string" && record.profile.email.trim() ? record.profile.email.trim() : undefined,
    },
    savedPropertyIds,
    consents: {
      privacyAcceptedAt:
        typeof record.consents?.privacyAcceptedAt === "number" ? record.consents.privacyAcceptedAt : undefined,
      termsAcceptedAt:
        typeof record.consents?.termsAcceptedAt === "number" ? record.consents.termsAcceptedAt : undefined,
      microphoneAcceptedAt:
        typeof record.consents?.microphoneAcceptedAt === "number" ? record.consents.microphoneAcceptedAt : undefined,
      supportAcceptedAt:
        typeof record.consents?.supportAcceptedAt === "number" ? record.consents.supportAcceptedAt : undefined,
    },
    preferences: {
      locale: "ar",
      onboardingCompletedAt:
        typeof record.preferences?.onboardingCompletedAt === "number"
          ? record.preferences.onboardingCompletedAt
          : undefined,
      financeDefaults: {
        downPaymentPercent:
          typeof record.preferences?.financeDefaults?.downPaymentPercent === "number"
            ? record.preferences.financeDefaults.downPaymentPercent
            : DEFAULT_PREFERENCES.financeDefaults.downPaymentPercent,
        preferredYears:
          typeof record.preferences?.financeDefaults?.preferredYears === "number"
            ? record.preferences.financeDefaults.preferredYears
            : DEFAULT_PREFERENCES.financeDefaults.preferredYears,
        annualRate:
          typeof record.preferences?.financeDefaults?.annualRate === "number"
            ? record.preferences.financeDefaults.annualRate
            : DEFAULT_PREFERENCES.financeDefaults.annualRate,
      },
    },
  };
}

function readWebStorageValue() {
  if (Platform.OS !== "web") return null;
  try {
    return globalThis.localStorage?.getItem(WEB_BUYER_ACCOUNT_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeWebStorageValue(value: string) {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.setItem(WEB_BUYER_ACCOUNT_KEY, value);
    return true;
  } catch {
    return false;
  }
}

function clearWebStorageValue() {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.removeItem(WEB_BUYER_ACCOUNT_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * WHY:   Buyer-specific saved properties, consent flags, and onboarding state must survive app restarts in both fallback and live modes.
 * WHAT:  Persists a compact local buyer-account record that complements any live server identity.
 * HOW:   Uses the same per-device storage approach as the thread store and normalizes unknown payloads back into the mobile contract.
 */
export async function saveBuyerLocalState(state: MobileBuyerLocalState) {
  try {
    const serialized = JSON.stringify(state);
    if (writeWebStorageValue(serialized)) return;

    const handle = getNativeStorageHandle();
    if (!handle) return;
    ensureNativeStorage(handle);
    handle.file.write(serialized);
  } catch (error) {
    console.warn("[buyer local state] save failed", error);
  }
}

/**
 * WHY:   The mobile app should hydrate buyer preferences and saved items before route decisions and secondary screens render.
 * WHAT:  Loads the normalized local buyer-account record from device storage.
 * HOW:   Parses the serialized payload and falls back to a safe default state when the file is missing or invalid.
 */
export async function loadBuyerLocalState(): Promise<MobileBuyerLocalState> {
  try {
    const webValue = readWebStorageValue();
    if (webValue !== null) {
      if (!webValue.trim()) return EMPTY_BUYER_LOCAL_STATE;
      return normalizeBuyerLocalState(JSON.parse(webValue));
    }

    const handle = getNativeStorageHandle();
    if (!handle?.file.exists) return EMPTY_BUYER_LOCAL_STATE;
    const value = await handle.file.text();
    if (!value.trim()) return EMPTY_BUYER_LOCAL_STATE;
    return normalizeBuyerLocalState(JSON.parse(value));
  } catch {
    return EMPTY_BUYER_LOCAL_STATE;
  }
}

/**
 * WHY:   Account reset and logout flows need a direct way to remove buyer-local preferences and saved items without touching backend records.
 * WHAT:  Clears the persisted buyer-account record from device storage.
 * HOW:   Deletes the storage entry when present and ignores missing-file cases.
 */
export async function clearBuyerLocalState() {
  try {
    if (clearWebStorageValue()) return;

    const handle = getNativeStorageHandle();
    if (handle?.file.exists) {
      handle.file.delete();
    }
  } catch (error) {
    console.warn("[buyer local state] clear failed", error);
  }
}

export function emptyBuyerLocalState() {
  return EMPTY_BUYER_LOCAL_STATE;
}


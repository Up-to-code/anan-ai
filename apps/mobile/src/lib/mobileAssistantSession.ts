import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

const WEB_ASSISTANT_SESSION_KEY = "anan-mobile:assistant-session";

export type MobileAssistantSession = {
  guestId: string;
  channelSessionToken: string;
  expiresAt: number;
};

function getNativeStorageHandle() {
  if (Platform.OS === "web") return null;

  const directory = new Directory(Paths.document, "anan-mobile");
  const file = new File(directory, "assistant-session.json");
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

function readWebStorageValue() {
  if (Platform.OS !== "web") return null;
  try {
    return globalThis.localStorage?.getItem(WEB_ASSISTANT_SESSION_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeWebStorageValue(value: string) {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.setItem(WEB_ASSISTANT_SESSION_KEY, value);
    return true;
  } catch {
    return false;
  }
}

function clearWebStorageValue() {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.removeItem(WEB_ASSISTANT_SESSION_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * WHY:   Guest-to-auth assistant promotion needs the public assistant session token even after auth redirects recreate the JS runtime.
 * WHAT:  Persists the active guest public-assistant session on device storage.
 * HOW:   Stores a small JSON record beside the other mobile guest artifacts and silently ignores storage failures.
 */
export async function saveGuestAssistantSession(session: MobileAssistantSession) {
  try {
    const serialized = JSON.stringify(session);
    if (writeWebStorageValue(serialized)) return;

    const handle = getNativeStorageHandle();
    if (!handle) return;
    ensureNativeStorage(handle);
    handle.file.write(serialized);
  } catch (error) {
    console.warn("[mobile assistant session] save failed", error);
  }
}

/**
 * WHY:   The mobile app should resume guest assistant continuity across app restarts and sign-in round trips.
 * WHAT:  Loads the stored guest public-assistant session when one exists and is still structurally valid.
 * HOW:   Parses a small persisted JSON payload and returns `null` for missing or invalid values.
 */
export async function loadGuestAssistantSession(): Promise<MobileAssistantSession | null> {
  try {
    const webValue = readWebStorageValue();
    if (webValue !== null) {
      if (!webValue.trim()) return null;
      const parsed = JSON.parse(webValue) as Partial<MobileAssistantSession>;
      if (
        typeof parsed.guestId === "string" &&
        typeof parsed.channelSessionToken === "string" &&
        typeof parsed.expiresAt === "number"
      ) {
        return {
          guestId: parsed.guestId,
          channelSessionToken: parsed.channelSessionToken,
          expiresAt: parsed.expiresAt,
        };
      }
      return null;
    }

    const handle = getNativeStorageHandle();
    if (!handle?.file.exists) return null;
    const value = await handle.file.text();
    if (!value.trim()) return null;
    const parsed = JSON.parse(value) as Partial<MobileAssistantSession>;
    if (
      typeof parsed.guestId === "string" &&
      typeof parsed.channelSessionToken === "string" &&
      typeof parsed.expiresAt === "number"
    ) {
      return {
        guestId: parsed.guestId,
        channelSessionToken: parsed.channelSessionToken,
        expiresAt: parsed.expiresAt,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * WHY:   After guest promotion or an explicit reset, the app must stop reusing a stale guest assistant session token.
 * WHAT:  Clears the stored guest public-assistant session from local device storage.
 * HOW:   Removes the web storage entry or native file when present and ignores missing-file cases.
 */
export async function clearGuestAssistantSession() {
  try {
    if (clearWebStorageValue()) return;

    const handle = getNativeStorageHandle();
    if (handle?.file.exists) {
      handle.file.delete();
    }
  } catch (error) {
    console.warn("[mobile assistant session] clear failed", error);
  }
}

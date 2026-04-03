import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";
import { emptyThreadStore, parseThreadStore } from "@/lib/mobileThreadStore";
import type { MobileGuestThreadStore, MobileGuestSnapshot } from "@/types/mobile";

const WEB_GUEST_THREAD_KEY = "anan-mobile:guest-thread";

function getNativeStorageHandle() {
  if (Platform.OS === "web") return null;

  const directory = new Directory(Paths.document, "anan-mobile");
  const file = new File(directory, "guest-thread.json");
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
    return globalThis.localStorage?.getItem(WEB_GUEST_THREAD_KEY) ?? null;
  } catch {
    return null;
  }
}

function writeWebStorageValue(value: string) {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.setItem(WEB_GUEST_THREAD_KEY, value);
    return true;
  } catch {
    return false;
  }
}

function clearWebStorageValue() {
  if (Platform.OS !== "web") return false;
  try {
    globalThis.localStorage?.removeItem(WEB_GUEST_THREAD_KEY);
    return true;
  } catch {
    return false;
  }
}

/**
 * WHY:   Guest conversations must survive app backgrounding and the browser sign-in round trip.
 * WHAT:  Persists the active mobile transcript into a small JSON file on device storage.
 * HOW:   Uses Expo FileSystem in the app document directory and keeps the storage shape opaque to screens.
 */
export async function saveGuestThreadSnapshot(snapshot: MobileGuestSnapshot) {
  try {
    const serialized = JSON.stringify(snapshot);
    if (writeWebStorageValue(serialized)) return;

    const handle = getNativeStorageHandle();
    if (!handle) return;
    ensureNativeStorage(handle);
    handle.file.write(serialized);
  } catch (error) {
    console.warn("[mobile guest snapshot] save failed", error);
  }
}

/**
 * WHY:   The assistant home screen should restore the last guest conversation without waiting for server state.
 * WHAT:  Reads the locally persisted guest transcript snapshot when present.
 * HOW:   Parses the JSON file and returns `null` when the file is empty, missing, or invalid.
 */
export async function loadGuestThreadSnapshot(): Promise<MobileGuestSnapshot | null> {
  try {
    const webValue = readWebStorageValue();
    if (webValue !== null) {
      return webValue.trim() ? (JSON.parse(webValue) as MobileGuestSnapshot) : null;
    }

    const handle = getNativeStorageHandle();
    if (!handle?.file.exists) return null;
    const value = await handle.file.text();
    return value.trim() ? (JSON.parse(value) as MobileGuestSnapshot) : null;
  } catch {
    return null;
  }
}

/**
 * WHY:   The buyer app now keeps multiple local threads instead of only one active guest snapshot.
 * WHAT:  Persists the lightweight on-device thread store used by the assistant home screen.
 * HOW:   Reuses the same storage file, allowing legacy single-thread snapshots to be migrated transparently on the next read.
 */
export async function saveGuestThreadStore(store: MobileGuestThreadStore) {
  try {
    const serialized = JSON.stringify(store);
    if (writeWebStorageValue(serialized)) return;

    const handle = getNativeStorageHandle();
    if (!handle) return;
    ensureNativeStorage(handle);
    handle.file.write(serialized);
  } catch (error) {
    console.warn("[mobile guest thread store] save failed", error);
  }
}

/**
 * WHY:   The assistant should restore recent local threads and the active transcript without backend state.
 * WHAT:  Reads the persisted thread store from local device storage.
 * HOW:   Parses the JSON payload, supports the legacy snapshot shape, and falls back to an empty store on invalid data.
 */
export async function loadGuestThreadStore(): Promise<MobileGuestThreadStore> {
  try {
    const webValue = readWebStorageValue();
    if (webValue !== null) {
      if (!webValue.trim()) return emptyThreadStore();
      return parseThreadStore(JSON.parse(webValue)) ?? emptyThreadStore();
    }

    const handle = getNativeStorageHandle();
    if (!handle?.file.exists) return emptyThreadStore();
    const value = await handle.file.text();
    if (!value.trim()) return emptyThreadStore();
    return parseThreadStore(JSON.parse(value)) ?? emptyThreadStore();
  } catch {
    return emptyThreadStore();
  }
}

/**
 * WHY:   The user needs an explicit way to reset the guest transcript after it has been synced or abandoned.
 * WHAT:  Removes the on-device guest snapshot file contents.
 * HOW:   Deletes the file when present and silently ignores missing-file cases.
 */
export async function clearGuestThreadSnapshot() {
  try {
    if (clearWebStorageValue()) return;

    const handle = getNativeStorageHandle();
    if (handle?.file.exists) {
      handle.file.delete();
    }
  } catch (error) {
    console.warn("[mobile guest snapshot] clear failed", error);
  }
}

export const clearGuestThreadStore = clearGuestThreadSnapshot;

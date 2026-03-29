import { Directory, File, Paths } from "expo-file-system";
import type { MobileGuestSnapshot } from "@/types/mobile";

const MOBILE_CACHE_DIR = new Directory(Paths.document, "anan-mobile");
const GUEST_THREAD_FILE = new File(MOBILE_CACHE_DIR, "guest-thread.json");

function ensureStorage() {
  if (!MOBILE_CACHE_DIR.exists) {
    MOBILE_CACHE_DIR.create();
  }
  if (!GUEST_THREAD_FILE.exists) {
    GUEST_THREAD_FILE.create();
  }
}

/**
 * WHY:   Guest conversations must survive app backgrounding and the browser sign-in round trip.
 * WHAT:  Persists the active mobile transcript into a small JSON file on device storage.
 * HOW:   Uses Expo FileSystem in the app document directory and keeps the storage shape opaque to screens.
 */
export async function saveGuestThreadSnapshot(snapshot: MobileGuestSnapshot) {
  try {
    ensureStorage();
    GUEST_THREAD_FILE.write(JSON.stringify(snapshot));
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
    if (!GUEST_THREAD_FILE.exists) return null;
    const value = await GUEST_THREAD_FILE.text();
    return value.trim() ? (JSON.parse(value) as MobileGuestSnapshot) : null;
  } catch {
    return null;
  }
}

/**
 * WHY:   The user needs an explicit way to reset the guest transcript after it has been synced or abandoned.
 * WHAT:  Removes the on-device guest snapshot file contents.
 * HOW:   Deletes the file when present and silently ignores missing-file cases.
 */
export async function clearGuestThreadSnapshot() {
  try {
    if (GUEST_THREAD_FILE.exists) {
      GUEST_THREAD_FILE.delete();
    }
  } catch (error) {
    console.warn("[mobile guest snapshot] clear failed", error);
  }
}

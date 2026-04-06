import { Directory, File, Paths } from "expo-file-system";
import { Platform } from "react-native";

export type ThemeOverrideMode = "light" | "dark" | "system";

const WEB_THEME_KEY = "anan-mobile:theme-preference";

function getNativeStorageHandle() {
  if (Platform.OS === "web") return null;

  const directory = new Directory(Paths.document, "anan-mobile");
  const file = new File(directory, "theme-preference.json");
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

/**
 * Persist the global theme preference onto local device storage.
 */
export async function setThemePreference(mode: ThemeOverrideMode) {
  try {
    if (Platform.OS === "web") {
      globalThis.localStorage?.setItem(WEB_THEME_KEY, mode);
      return;
    }

    const handle = getNativeStorageHandle();
    if (!handle) return;
    ensureNativeStorage(handle);
    handle.file.write(mode);
  } catch (error) {
    console.warn("[theme config] save failed", error);
  }
}

/**
 * Read the saved theme preference from local device storage without waiting for the server.
 */
export async function getThemePreference(): Promise<ThemeOverrideMode> {
  try {
    if (Platform.OS === "web") {
      const webValue = globalThis.localStorage?.getItem(WEB_THEME_KEY);
      if (webValue === "light" || webValue === "dark" || webValue === "system") {
        return webValue;
      }
      return "system";
    }

    const handle = getNativeStorageHandle();
    if (!handle?.file.exists) return "system";
    
    const value = await handle.file.text();
    const mode = value.trim();
    if (mode === "light" || mode === "dark" || mode === "system") {
      return mode;
    }
    
    return "system";
  } catch {
    return "system";
  }
}

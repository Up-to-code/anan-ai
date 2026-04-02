import { cookies } from "next/headers";
import { getWebDictionary } from "@/lib/i18n";
import { resolveLocale, type AppLocale, WORKSPACE_LOCALE_COOKIE } from "@/lib/locale";

/**
 * WHY:   Workspace routes should not inherit the public site's locale preference unless the user explicitly changes the workspace language.
 * WHAT:  Resolves the locale for `/ws` from its dedicated cookie and defaults safely to Arabic.
 * HOW:   Reads `anan_workspace_locale` from the request cookies and falls back to `ar` when the cookie is missing or unavailable.
 */
export async function getWorkspaceLocale(): Promise<AppLocale> {
  try {
    const cookieStore = await cookies();
    return resolveLocale(cookieStore.get(WORKSPACE_LOCALE_COOKIE)?.value);
  } catch {
    return "ar";
  }
}

/**
 * WHY:   Workspace layouts frequently need both the locale and the translated dictionary together.
 * WHAT:  Resolves the workspace locale and returns the matching dictionary bundle.
 * HOW:   Reuses `getWorkspaceLocale` so every workspace page shares the same fallback behavior.
 */
export async function getWorkspaceLocaleContext() {
  const locale = await getWorkspaceLocale();
  return {
    locale,
    dictionary: getWebDictionary(locale),
  };
}

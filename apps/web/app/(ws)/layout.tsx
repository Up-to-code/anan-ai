import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "../ConvexClientProvider";
import { WebLocaleProvider } from "../_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";
import { getWorkspaceLocale } from "./ws/_lib/workspaceLocale";

export const dynamic = "force-dynamic";

/**
 * WHY:   Every workspace route depends on the authenticated Convex runtime for live hooks and auth actions.
 * WHAT:  Anchors the Convex auth server/client providers at the stable `(ws)` route-group boundary.
 * HOW:   Wraps all workspace descendants once so nested zone layouts can stay focused on shell and data loading.
 */
export default async function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  const locale = await getWorkspaceLocale();
  const dictionary = getWebDictionary(locale);

  return (
    <ConvexAuthNextjsServerProvider>
      <ConvexClientProvider>
        <WebLocaleProvider locale={locale} dictionary={dictionary}>
          {children}
        </WebLocaleProvider>
      </ConvexClientProvider>
    </ConvexAuthNextjsServerProvider>
  );
}

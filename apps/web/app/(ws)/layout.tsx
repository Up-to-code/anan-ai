import ConvexClientProvider from "../ConvexClientProvider";
import { WebLocaleProvider } from "../_components/WebLocaleProvider";
import { getWebDictionary } from "@/lib/i18n";
import { getWorkspaceLocale } from "./ws/_lib/workspaceLocale";

export const dynamic = "force-dynamic";

/**
 * WHY:   Every workspace route depends on the authenticated Convex runtime for live hooks and auth actions.
 * WHAT:  Anchors the Clerk-backed Convex client provider at the stable `(ws)` route-group boundary.
 * HOW:   Wraps all workspace descendants once so nested zone layouts can stay focused on shell and data loading.
 */
export default async function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  const locale = await getWorkspaceLocale();
  const dictionary = getWebDictionary(locale);

  return (
    <ConvexClientProvider>
      <WebLocaleProvider locale={locale} dictionary={dictionary}>
        <div
          data-slot="workspace-group-layout"
          className="flex h-full min-h-screen min-h-dvh min-w-0 w-full flex-1 basis-0 flex-col"
        >
          {children}
        </div>
      </WebLocaleProvider>
    </ConvexClientProvider>
  );
}

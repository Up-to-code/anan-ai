import ConvexClientProvider from "../ConvexClientProvider";
import { WebLocaleProvider } from "../_components/WebLocaleProvider";
import AuthSdkWorkspaceProvider from "./AuthSdkWorkspaceProvider";
import { getToken } from "@/lib/auth-server";
import { getWebDictionary } from "@/lib/i18n";
import { getInitialAuthSdkSession } from "@/lib/auth-sdk-session";
import { getWorkspaceLocale } from "./ws/_lib/workspaceLocale";

export const dynamic = "force-dynamic";

/**
 * WHY:   Every workspace route depends on the authenticated Convex runtime for live hooks and auth actions.
 * WHAT:  Anchors the Better Auth-backed Convex client provider at the stable `(ws)` route-group boundary.
 * HOW:   Wraps all workspace descendants once so nested zone layouts can stay focused on shell and data loading.
 */
export default async function WorkspaceGroupLayout({ children }: { children: React.ReactNode }) {
  const locale = await getWorkspaceLocale();
  const dictionary = getWebDictionary(locale);
  const [initialToken, initialSession] = await Promise.all([
    getToken().catch(() => null),
    getInitialAuthSdkSession(),
  ]);

  return (
    <ConvexClientProvider initialToken={initialToken}>
      <WebLocaleProvider locale={locale} dictionary={dictionary}>
        <AuthSdkWorkspaceProvider initialSession={initialSession}>
          <div
            data-slot="workspace-group-layout"
            className="flex h-full min-h-screen min-h-dvh min-w-0 w-full flex-1 basis-0 flex-col"
          >
            {children}
          </div>
        </AuthSdkWorkspaceProvider>
      </WebLocaleProvider>
    </ConvexClientProvider>
  );
}

import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getWorkspaceLocaleContext } from "../../_lib/workspaceLocale";
import { getCurrentProfileForCurrentUser } from "@/server/domains/auth/profiles/service";
import ProfileWorkspace from "./_components/ProfileWorkspace";
import { saveProfileAction } from "./actions";

/**
 * WHY:   The workspace account center should reflect real profile and security state, not a placeholder card.
 * WHAT:  Loads the current workspace/profile snapshot and renders the editable account center.
 * HOW:   Resolves the profile on the server and delegates only the interactive form controls to a small client component.
 */
export default async function WorkspaceMePage() {
  const [{ dictionary }, workspace, profile] = await Promise.all([
    getWorkspaceLocaleContext(),
    requireWorkspaceData("/ws/me"),
    getCurrentProfileForCurrentUser(),
  ]);

  const resolvedProfile = profile ?? {
    email: workspace.user.email ?? undefined,
    name: workspace.user.name ?? undefined,
    username: workspace.user.email?.split("@")[0] ?? undefined,
    role: workspace.audience === "developer" ? "developer" : workspace.audience === "broker" ? "broker" : "user",
    showInOffersDirectory: true,
    isActive: workspace.user.isActive,
    authProvider: {
      id: "google" as const,
      passwordManaged: false as const,
    },
  };

  return (
    <div className="mx-auto min-h-max w-full max-w-4xl space-y-5 p-6 pb-20 lg:min-h-full lg:p-8 lg:pb-24">
      <header className="space-y-1 px-1">
        <div className="text-[11px] font-semibold text-[var(--workspace-muted)]">{dictionary.settings.workspaceLabel}</div>
        <h1 className="text-[28px] font-bold tracking-tight text-foreground">{dictionary.settings.accountSettingsTitle}</h1>
        <p className="max-w-2xl text-sm font-medium leading-7 text-muted-foreground">{dictionary.settings.accountSettingsDescription}</p>
      </header>

      <ProfileWorkspace
        initialProfile={resolvedProfile}
        fallbackName={workspace.user.name || "مستخدم عنان"}
        fallbackEmail={workspace.user.email || ""}
        onSave={saveProfileAction}
      />
    </div>
  );
}

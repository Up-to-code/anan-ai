import { requireWorkspaceData } from "../../_lib/workspaceData";
import { getCurrentProfileForCurrentUser } from "@/server/domains/profiles/service";
import ProfileWorkspace from "./_components/ProfileWorkspace";

/**
 * WHY:   The workspace account center should reflect real profile and security state, not a placeholder card.
 * WHAT:  Loads the current workspace/profile snapshot and renders the editable account center.
 * HOW:   Resolves the profile on the server and delegates only the interactive form controls to a small client component.
 */
export default async function WorkspaceMePage() {
  const [workspace, profile] = await Promise.all([
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
    <div className="space-y-8 p-6 lg:p-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-slate-950">الحساب والأمان</h1>
        <p className="text-sm font-medium text-slate-500">
          إدارة معلومات الحساب، اسم المستخدم، والأدوات المرتبطة بمساحة العمل.
        </p>
      </header>

      <ProfileWorkspace
        initialProfile={resolvedProfile}
        fallbackName={workspace.user.name || "مستخدم أنان"}
        fallbackEmail={workspace.user.email || ""}
      />
    </div>
  );
}

import WorkspaceShell from "./_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "./_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "./_lib/workspaceData";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "./_lib/complianceBanner";
import { getWorkspaceLocale } from "./_lib/workspaceLocale";

/**
 * WHY:   The workspace shell should persist while users move across sibling workspace routes.
 * WHAT:  Mounts the shared `WorkspaceShell` once at `/ws` so child route groups render inside stable chrome.
 * HOW:   Loads the common workspace chrome payload at the route root, then leaves nested layouts to render zone-specific content only.
 */
export default async function WorkspaceRootLayout({ children }: { children: React.ReactNode }) {
  const [workspace, chrome, complianceRuleset, locale] = await Promise.all([
    requireWorkspaceData("/ws"),
    getLayoutSidebarData("/ws"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
    getWorkspaceLocale(),
  ]);
  const primaryOrganization = chrome.organizations[0];

  if (!primaryOrganization) {
    return (
      <div
        data-slot="workspace-root-layout"
        className="workspace-root-chrome flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 flex-col"
      >
        {children}
      </div>
    );
  }

  const complianceBanner = buildComplianceBanner(primaryOrganization, complianceRuleset);

  return (
    <div
      data-slot="workspace-root-layout"
      className="workspace-root-chrome flex h-full min-h-0 min-w-0 w-full flex-1 basis-0 flex-col"
    >
      <WorkspaceShell
        user={chrome.user}
        visibleZoneKeys={workspace.visibleZoneKeys}
        organization={getWorkspaceOrganizationDisplay({
          name: primaryOrganization.name,
          type: primaryOrganization.type,
          status: primaryOrganization.status,
          logoUrl: primaryOrganization.logoUrl,
          isVerified: primaryOrganization.isVerified,
          locale,
        })}
        recentAssistantThreads={chrome.recentAssistantThreads}
        allAssistantThreads={chrome.allAssistantThreads}
        signalCounts={chrome.signalCounts}
        complianceBanner={complianceBanner}
      >
        {children}
      </WorkspaceShell>
    </div>
  );
}

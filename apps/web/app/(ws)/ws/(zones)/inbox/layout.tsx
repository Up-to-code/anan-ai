import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../../_lib/complianceBanner";
import { getWorkspaceLocale } from "../../_lib/workspaceLocale";

export default async function InboxZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome, complianceRuleset] = await Promise.all([
    requireWorkspaceData("/ws/inbox"),
    getLayoutSidebarData("/ws/inbox"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
  ]);
  const locale = await getWorkspaceLocale();
  const primaryOrganization = chrome.organizations?.[0];

  if (!primaryOrganization) {
    return <div className="min-h-svh bg-background text-foreground">{children}</div>;
  }

  const complianceBanner = buildComplianceBanner(primaryOrganization, complianceRuleset);

  return (
    <WorkspaceShell
      user={chrome.user}
      visibleZoneKeys={workspace.visibleZoneKeys}
      recentAssistantThreads={chrome.recentAssistantThreads}
      allAssistantThreads={chrome.allAssistantThreads}
      signalCounts={chrome.signalCounts}
      complianceBanner={complianceBanner}
      organization={getWorkspaceOrganizationDisplay({
        name: primaryOrganization?.name,
        type: primaryOrganization?.type,
        status: primaryOrganization?.status,
        logoUrl: primaryOrganization?.logoUrl,
        isVerified: primaryOrganization?.isVerified,
        zoneLabel: locale === "fr" ? "Boite de reception" : locale === "en" ? "Inbox" : "البريد الوارد",
      })}
    >
      {children}
    </WorkspaceShell>
  );
}

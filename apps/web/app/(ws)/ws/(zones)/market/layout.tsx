import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import MarketRouteTabs from "./MarketRouteTabs";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../../_lib/complianceBanner";

export default async function MarketZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome, complianceRuleset] = await Promise.all([
    requireWorkspaceData("/ws/market"),
    getLayoutSidebarData("/ws/market"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
  ]);
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
        name: primaryOrganization.name,
        type: primaryOrganization.type,
        status: primaryOrganization.status,
        zoneLabel: "ذكاء السوق",
      })}
    >
      <div data-slot="market-shell" className="flex min-h-full flex-col bg-background text-foreground">
        <MarketRouteTabs />
        <div className="flex-1">{children}</div>
      </div>
    </WorkspaceShell>
  );
}

import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import CrmRouteTabs from "./CrmRouteTabs";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../../_lib/complianceBanner";
import { getWorkspaceLocale } from "../../_lib/workspaceLocale";

export default async function CrmZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspace, chrome, complianceRuleset] = await Promise.all([
    requireWorkspaceData("/ws/crm"),
    getLayoutSidebarData("/ws/crm"),
    getComplianceRulesetForCurrentOrg().catch(() => null),
  ]);
  const locale = await getWorkspaceLocale();
  const primaryOrganization = chrome.organizations?.[0];

  if (!primaryOrganization) {
    return <div className="min-h-svh bg-white">{children}</div>;
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
        zoneLabel: locale === "fr" ? "Transactions" : locale === "en" ? "Deal management" : "إدارة الصفقات",
      })}
    >
      <div className="flex min-h-full flex-col">
        <CrmRouteTabs
          labels={{
            deals: locale === "fr" ? "Transactions" : locale === "en" ? "Deals" : "الصفقات",
            clients: locale === "fr" ? "Clients" : locale === "en" ? "Clients" : "العملاء",
          }}
        />
        <div className="flex-1">{children}</div>
      </div>
    </WorkspaceShell>
  );
}

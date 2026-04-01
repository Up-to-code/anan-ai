import WorkspaceShell from "../../_components/WorkspaceShell";
import { getWorkspaceOrganizationDisplay } from "../../_lib/organizationDisplay";
import { getLayoutSidebarData, requireWorkspaceData } from "../../_lib/workspaceData";
import CrmRouteTabs from "./CrmRouteTabs";
import { getComplianceRulesetForCurrentOrg } from "@/server/domains/compliance/service";
import { buildComplianceBanner } from "../../_lib/complianceBanner";
import { cookies } from "next/headers";
import { resolveLocale } from "@/lib/locale";

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
  const locale = resolveLocale((await cookies()).get("anan_web_locale")?.value);
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
        zoneLabel: locale === "fr" ? "Transactions" : locale === "en" ? "Deal management" : "إدارة الصفقات",
      })}
    >
      <div className="flex min-h-full flex-col">
        <CrmRouteTabs />
        <div className="flex-1">{children}</div>
      </div>
    </WorkspaceShell>
  );
}

import CrmRouteTabs from "./shared/navigation/CrmRouteTabs";
import { getWorkspaceLocale } from "../../_lib/workspaceLocale";

/**
 * WHY:   CRM routes still need their local tab chrome after moving the shared workspace shell to `/ws`.
 * WHAT:  Renders CRM-specific tabs and content without remounting the global header/sidebar.
 * HOW:   Loads only locale-dependent tab labels here and leaves workspace-wide chrome to the parent layout.
 */
export default async function CrmZoneLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getWorkspaceLocale();

  return (
    <div className="flex min-h-full flex-col">
      <CrmRouteTabs
        labels={{
          deals: locale === "fr" ? "Transactions" : locale === "en" ? "Deals" : "الصفقات",
          clients: locale === "fr" ? "Clients" : locale === "en" ? "Clients" : "العملاء",
        }}
      />
      <div className="flex-1">{children}</div>
    </div>
  );
}

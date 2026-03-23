import type { ReactNode } from "react";
import PageHeader from "@/components/shared/PageHeader";
import RouteTabs from "@/components/shared/RouteTabs";
import type { RouteTab } from "@/lib/adminNavigation";

type SectionScaffoldProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  tabs?: RouteTab[];
  actions?: ReactNode;
  children: ReactNode;
};

/**
 * WHY:   Many admin route groups still need a consistent frame for title, optional tabs, and body content.
 * WHAT:  Composes the section header, secondary tabs, and page body.
 * HOW:   Treats tabs as optional so simple sections can render without empty tab chrome.
 */
export default function SectionScaffold({ eyebrow, title, description, tabs, actions, children }: SectionScaffoldProps) {
  return (
    <div className="space-y-4">
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {tabs && tabs.length > 0 ? <RouteTabs tabs={tabs} /> : null}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

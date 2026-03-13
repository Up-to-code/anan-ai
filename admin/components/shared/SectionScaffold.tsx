import type { ReactNode } from "react";
import PageHeader from "@/components/shared/PageHeader";
import RouteTabs from "@/components/shared/RouteTabs";
import type { RouteTab } from "@/lib/adminNavigation";

type SectionScaffoldProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  tabs: RouteTab[];
  children: ReactNode;
};

/**
 * WHY:   The Arabic redesign needs a consistent section frame above every tabbed workspace.
 * WHAT:  Renders the page header, route-backed tabs, and page body for a section.
 * HOW:   Composes the shared header and tab primitives once so route files stay thin.
 */
export default function SectionScaffold({ eyebrow, title, description, tabs, children }: SectionScaffoldProps) {
  return (
    <div className="space-y-8">
      <PageHeader eyebrow={eyebrow} title={title} description={description} />
      <RouteTabs tabs={tabs} />
      <div className="space-y-6">{children}</div>
    </div>
  );
}

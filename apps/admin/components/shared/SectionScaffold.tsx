import type { ReactNode } from "react";
import AdminPageLayout, { type AdminPageLayoutVariant } from "@/components/shared/AdminPageLayout";
import PageHeader from "@/components/shared/PageHeader";
import RouteTabs from "@/components/shared/RouteTabs";
import type { RouteTab } from "@/lib/adminNavigation";
import { cn } from "@/lib/utils";

type SectionScaffoldProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  tabs?: RouteTab[];
  actions?: ReactNode;
  children: ReactNode;
  rail?: ReactNode;
  layout?: AdminPageLayoutVariant;
  className?: string;
  bodyClassName?: string;
  railClassName?: string;
};

/**
 * WHY:   Many admin route groups still need a consistent frame for title, optional tabs, and body content.
 * WHAT:  Composes the section header, secondary tabs, and page body.
 * HOW:   Treats tabs as optional so simple sections can render without empty tab chrome.
 */
export default function SectionScaffold({
  eyebrow,
  title,
  description,
  tabs,
  actions,
  children,
  rail,
  layout = "detail",
  className,
  bodyClassName,
  railClassName,
}: SectionScaffoldProps) {
  return (
    <div className={cn("grid min-w-0 max-w-full content-start gap-4 overflow-x-clip xl:gap-5", className)}>
      <PageHeader eyebrow={eyebrow} title={title} description={description} actions={actions} />
      {tabs && tabs.length > 0 ? <RouteTabs tabs={tabs} /> : null}
      <AdminPageLayout
        main={children}
        rail={rail}
        variant={layout}
        className={bodyClassName}
        railClassName={railClassName}
      />
    </div>
  );
}

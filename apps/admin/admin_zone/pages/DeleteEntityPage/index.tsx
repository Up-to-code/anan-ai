import MockDeleteEntity from "@/components/shared/MockDeleteEntity";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import type { RouteTab } from "@/lib/adminNavigation";

type DeleteEntityPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  entityLabel: string;
  entityName: string;
  backHref: string;
  tabs?: RouteTab[];
};

/**
 * WHY:   Destructive admin flows should share one plain confirmation screen instead of bespoke warning layouts.
 * WHAT:  Renders a route-backed delete confirmation page for any mocked admin entity.
 * HOW:   Composes the shared section scaffold with the reusable confirmation client component.
 */
export default function DeleteEntityPage({
  eyebrow,
  title,
  description,
  entityLabel,
  entityName,
  backHref,
  tabs,
}: DeleteEntityPageProps) {
  return (
    <SectionScaffold
      eyebrow={eyebrow}
      title={title}
      description={description}
      tabs={tabs}
      actions={<PageActions actions={[{ label: "الرجوع", href: backHref, variant: "outline" }]} />}
    >
      <MockDeleteEntity entityLabel={entityLabel} entityName={entityName} backHref={backHref} />
    </SectionScaffold>
  );
}

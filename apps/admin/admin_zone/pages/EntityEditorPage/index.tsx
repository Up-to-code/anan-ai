import MockEntityForm from "@/components/shared/MockEntityForm";
import PageActions from "@/components/shared/PageActions";
import SectionScaffold from "@/components/shared/SectionScaffold";
import type { RouteTab } from "@/lib/adminNavigation";

type EntityEditorField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "textarea" | "select";
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  defaultValue?: string | number;
  helpText?: string;
};

type EntityEditorPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  entityLabel: string;
  mode: "create" | "edit";
  backHref: string;
  fields: EntityEditorField[];
  tabs?: RouteTab[];
};

/**
 * WHY:   Admin CRUD routes need a thin, repeatable editor page instead of many near-identical implementations.
 * WHAT:  Wraps the generic mock entity form in the shared section scaffold and page actions.
 * HOW:   Delegates all interactive state to `MockEntityForm` while keeping route-specific metadata server-rendered.
 */
export default function EntityEditorPage({
  eyebrow,
  title,
  description,
  entityLabel,
  mode,
  backHref,
  fields,
  tabs,
}: EntityEditorPageProps) {
  return (
    <SectionScaffold
      eyebrow={eyebrow}
      title={title}
      description={description}
      tabs={tabs}
      actions={<PageActions actions={[{ label: "الرجوع", href: backHref, variant: "outline" }]} />}
    >
      <MockEntityForm entityLabel={entityLabel} mode={mode} fields={fields} backHref={backHref} />
    </SectionScaffold>
  );
}

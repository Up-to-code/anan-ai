import Button from "@/components/shared/Button";

type PageAction = {
  label: string;
  href?: string;
  variant?: "primary" | "outline" | "ghost" | "dark" | "white";
};

type PageActionsProps = {
  actions: PageAction[];
};

/**
 * WHY:   Admin list and detail screens need a consistent set of top-level actions without repeating toolbar markup.
 * WHAT:  Renders a compact row of action buttons backed by route hrefs.
 * HOW:   Maps the provided action config into the shared button component and keeps wrapping behavior responsive.
 */
export default function PageActions({ actions }: PageActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <Button key={`${action.label}-${action.href ?? "button"}`} href={action.href} variant={action.variant ?? "outline"}>
          {action.label}
        </Button>
      ))}
    </div>
  );
}

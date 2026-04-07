import type { ReactNode } from "react";
import AdminPageLayout from "@/components/shared/AdminPageLayout";
import { cn } from "@/lib/utils";

type AdminFormPageLayoutProps = {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
};

/**
 * WHY:   Admin create and edit routes need one consistent layout that feels like a real operations page.
 * WHAT:  Renders a two-column form workspace with a primary content column and an optional side summary rail.
 * HOW:   Stacks on mobile and switches to a measured main/sidebar grid on larger screens.
 */
export default function AdminFormPageLayout({ children, sidebar, className }: AdminFormPageLayoutProps) {
  return (
    <AdminPageLayout
      main={<div className="grid min-w-0 max-w-full content-start gap-4 xl:gap-5">{children}</div>}
      rail={sidebar}
      variant="form"
      className={cn("min-w-0 max-w-full", className)}
    />
  );
}

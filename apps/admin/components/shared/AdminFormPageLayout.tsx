import type { ReactNode } from "react";
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
    <div className={cn("grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]", className)}>
      <div className="space-y-4">{children}</div>
      {sidebar ? <aside className="space-y-4">{sidebar}</aside> : null}
    </div>
  );
}

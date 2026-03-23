import type { ReactNode } from "react";
import DocsShell from "@/components/docs/DocsShell";

/**
 * WHY:   All docs pages need a consistent public documentation frame.
 * WHAT:  Wraps docs routes with top navigation and sidebar shell.
 * HOW:   Uses a shared `DocsShell` component for layout consistency across all docs pages.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}

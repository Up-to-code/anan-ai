import type { Metadata } from "next";
import type { ReactNode } from "react";
import DocsShell from "@/components/docs/DocsShell";

export const metadata: Metadata = {
  title: "Anan Developer Docs",
  description: "Public integration docs for OAuth, organization API keys, and delegated APIs in Anan platform.",
};

/**
 * WHY:   All docs pages need a consistent public documentation frame.
 * WHAT:  Wraps docs routes with top navigation and sidebar shell.
 * HOW:   Uses a shared `DocsShell` component for layout consistency across all docs pages.
 */
export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <section dir="ltr" className="min-h-screen bg-slate-50 text-slate-950">
      <DocsShell>{children}</DocsShell>
    </section>
  );
}

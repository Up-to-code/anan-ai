import DocsLayoutShell from "@/admin_zone/pages/DocsPage/DocsLayoutShell";

/**
 * WHY:   The docs section should have its own handbook presentation instead of inheriting the admin dashboard shell.
 * WHAT:  Wraps every docs route in the shared docs-specific shell.
 * HOW:   Delegates the section hero and route navigation to the page-local docs layout component.
 */
export default function DocsSectionLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DocsLayoutShell>{children}</DocsLayoutShell>;
}

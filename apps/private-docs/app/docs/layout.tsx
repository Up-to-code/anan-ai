import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import DocsShell from "@/components/docs/DocsShell";
import { buildUnlockHref, hasPrivateDocsAccess } from "@/lib/privateAccess";

/**
 * WHY:   Every private handbook page should enforce the same access rule before rendering content.
 * WHAT:  Guards the docs routes and wraps unlocked requests with the shared documentation shell.
 * HOW:   Checks the `HttpOnly` access cookie on the server and redirects locked sessions back to the unlock page.
 */
export default async function DocsLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies();
  if (!hasPrivateDocsAccess(cookieStore)) {
    redirect(buildUnlockHref({ returnTo: "/docs/overview" }));
  }

  return <DocsShell>{children}</DocsShell>;
}

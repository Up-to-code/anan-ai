import { redirect } from "next/navigation";
import { getAuthenticatedSession } from "@/lib/serverSession";

/**
 * WHY:   In-app docs are intentionally removed from the rebuilt admin v1 experience.
 * WHAT:  Guards the legacy `/docs` route group, then redirects authenticated users back to `/dashboard`.
 * HOW:   Preserves auth behavior for direct hits while replacing the old docs shell with a single redirect.
 */
export default async function DocsRootLayout({
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthenticatedSession();

  if (!session.token || !session.user) {
    redirect("/signin?returnTo=/docs");
  }

  redirect("/dashboard");
}

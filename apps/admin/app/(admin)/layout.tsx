import { redirect } from "next/navigation";
import AdminShell from "@/components/shared/AdminShell";
import { getAuthenticatedSession } from "@/lib/serverSession";

/**
 * WHY:   Every admin route should share one guard and one operational shell.
 * WHAT:  Protects the admin route group and renders the shared admin navigation layout.
 * HOW:   Resolves the authenticated session on the server, redirects non-admin users, and passes the user into the shell.
 */
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getAuthenticatedSession();

  if (!session.token || !session.user || !session.isAdmin) {
    redirect("/signin?returnTo=/overview");
  }

  return <AdminShell user={session.user}>{children}</AdminShell>;
}

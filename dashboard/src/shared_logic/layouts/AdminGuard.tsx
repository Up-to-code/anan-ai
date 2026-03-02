import type { ReactNode } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { useSession } from "@/_core/lib/auth-client";
import { useIsAdmin } from "@/_core/hooks/useIsAdmin";

export default function AdminGuard({ children }: { children: ReactNode }) {
  const { data: session, isPending } = useSession();
  const isAdmin = useIsAdmin();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  if (!isAdmin && location.pathname.startsWith("/admin")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">404</h1>
        <p className="text-muted-foreground">Not found</p>
        <a href="/" className="text-primary hover:underline">
          Go home
        </a>
      </div>
    );
  }

  return <>{children}</>;
}

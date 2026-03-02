import { useSession } from "@/_core/lib/auth-client";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;
  return user?.role === "admin";
}

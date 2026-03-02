import { useSession } from "@/_core/lib/auth-client";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";

export type UserRole = "admin" | "broker" | "RED" | "normal" | "user";

export function useRole(): UserRole | undefined {
  const { data: session } = useSession();
  const authUserId = session?.user?.id;
  const profile = useQuery(api.shared_logic.dashboard.queries.getUserProfile, authUserId ? { authUserId } : "skip");

  if (!session?.user) return undefined;
  if (profile?.isActive === false) return undefined;

  return (profile?.role as UserRole) ?? ((session?.user as { role?: string })?.role as UserRole | undefined);
}

/** Extended version that also tells you if the session is still loading */
export function useRoleWithLoading(): { role: UserRole | undefined; isPending: boolean } {
  const { data: session, isPending: sessionPending } = useSession();
  const authUserId = session?.user?.id;
  const profile = useQuery(api.shared_logic.dashboard.queries.getUserProfile, authUserId ? { authUserId } : "skip");

  if (!session?.user) return { role: undefined, isPending: sessionPending };
  if (profile?.isActive === false) return { role: undefined, isPending: false };

  const isProfilePending = authUserId !== undefined && profile === undefined;
  const role = (profile?.role as UserRole) ?? ((session?.user as { role?: string })?.role as UserRole | undefined);

  return { role, isPending: sessionPending || isProfilePending };
}

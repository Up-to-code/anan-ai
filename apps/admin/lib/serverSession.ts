import {
  projectAuthenticatedSession,
  sanitizeInternalReturnTo as sanitizeReturnTo,
} from "@anan/web-foundation/auth-session";
import { redirect } from "next/navigation";
import { getOptionalSessionContext } from "@/server/auth/session";

export type { SessionUser } from "@/server/contracts/session";

type AuthenticatedSession = Awaited<ReturnType<typeof getAuthenticatedSession>>;
type RequiredAdminPageSession = AuthenticatedSession & {
  token: string;
  user: NonNullable<AuthenticatedSession["user"]>;
  isAdmin: true;
};

export function getAuthenticatedSession() {
  return projectAuthenticatedSession(getOptionalSessionContext);
}

export async function requireAdminPageSession(returnTo = "/overview") {
  const session = await getAuthenticatedSession();

  if (!session.token || !session.user || !session.isAdmin) {
    redirect(`/signin?returnTo=${encodeURIComponent(returnTo)}`);
  }

  return session as RequiredAdminPageSession;
}

export function sanitizeInternalReturnTo(returnTo?: string | null, fallback = "/overview") {
  return sanitizeReturnTo(returnTo, fallback);
}

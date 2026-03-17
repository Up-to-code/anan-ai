import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { DomainError } from "@/server/contracts/errors";
import type { ProfileSummary } from "@/server/contracts/profiles";
import type { SessionContext } from "@/server/contracts/session";
import { convexProfilesRepository, type ProfilesRepository } from "@/server/infrastructure/convex/profilesRepository";
import { convexSessionsRepository, type SessionsRepository } from "@/server/infrastructure/convex/sessionRepository";

export type ResolvedSession = {
  token: string;
  context: SessionContext;
  profile: ProfileSummary | null;
};

type SessionDependencies = {
  getToken: () => Promise<string | null>;
  sessionsRepository: SessionsRepository;
  profilesRepository: ProfilesRepository;
};

const defaultDependencies: SessionDependencies = {
  getToken: async () => (await convexAuthNextjsToken()) ?? null,
  sessionsRepository: convexSessionsRepository,
  profilesRepository: convexProfilesRepository,
};

function isNoAuthProviderError(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }

  if ("code" in error && error.code === "NoAuthProvider") {
    return true;
  }

  if (!("message" in error) || typeof error.message !== "string") {
    return false;
  }

  if (error.message.includes("No auth provider found matching the given token")) {
    return true;
  }

  try {
    const payload = JSON.parse(error.message) as { code?: unknown; message?: unknown };
    return payload.code === "NoAuthProvider"
      || (typeof payload.message === "string" && payload.message.includes("No auth provider found matching the given token"));
  } catch {
    return false;
  }
}

/**
 * WHY:   Every admin server entrypoint needs the same authenticated context without duplicating token and profile lookups.
 * WHAT:  Resolves the optional current session, returning null when no active authenticated user exists.
 * HOW:   Reads the Convex auth token, fetches the session projection and current profile, then builds SessionContext.
 */
export async function getOptionalSessionContext(
  dependencies: SessionDependencies = defaultDependencies,
): Promise<ResolvedSession | null> {
  const token = await dependencies.getToken();
  if (!token) {
    return null;
  }

  let user: Awaited<ReturnType<SessionsRepository["getCurrent"]>>;
  let profile: Awaited<ReturnType<ProfilesRepository["getCurrent"]>>;
  try {
    [user, profile] = await Promise.all([
      dependencies.sessionsRepository.getCurrent(token),
      dependencies.profilesRepository.getCurrent(token),
    ]);
  } catch (error) {
    // Stale tokens signed by an old issuer/audience should behave as logged-out sessions.
    if (isNoAuthProviderError(error)) {
      return null;
    }
    throw error;
  }

  if (!user || user.isActive === false) {
    return null;
  }

  return {
    token,
    profile,
    context: {
      userId: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      username: profile?.username,
      role: profile?.role,
      brokerId: profile?.brokerId,
      redId: profile?.REDId,
      isActive: user.isActive,
    },
  };
}

/**
 * WHY:   Protected admin routes and server actions should fail consistently when no authenticated session is available.
 * WHAT:  Resolves the current session or throws a normalized UNAUTHORIZED domain error.
 * HOW:   Delegates to `getOptionalSessionContext` and throws when it returns null.
 */
export async function requireSessionContext(
  dependencies: SessionDependencies = defaultDependencies,
): Promise<ResolvedSession> {
  const session = await getOptionalSessionContext(dependencies);
  if (!session) {
    throw new DomainError({
      code: "UNAUTHORIZED",
      message: "Authentication required",
      status: 401,
    });
  }

  return session;
}

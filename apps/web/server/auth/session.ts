import { cache } from "react";
import { getToken } from "@/lib/auth-server";
import {
  isClearlyExpiredJwtToken,
  isMissingAuthTokenConfigurationError,
  isNoAuthProviderError,
} from "../../../../convex/_core/security/authProviderErrors";
import { DomainError } from "@/server/contracts/errors";
import type { ProfileSummary } from "@/server/contracts/profiles";
import type { SessionContext } from "@/server/contracts/session";
import { convexProfilesRepository, type ProfilesRepository } from "@/server/infrastructure/convex/auth/profiles";
import { convexSessionsRepository, type SessionsRepository } from "@/server/infrastructure/convex/auth/session";

export type ResolvedSession = {
  token: string;
  context: SessionContext;
  profile: ProfileSummary | null;
};

type AuthOrganizationContext = {
  organizationId?: string | null;
  organizationSlug?: string | null;
  organizationRole?: string | null;
  organizationPermissions?: string[];
};

type SessionDependencies = {
  getToken: () => Promise<string | null>;
  getOrganizationContext: () => Promise<AuthOrganizationContext>;
  sessionsRepository: SessionsRepository;
  profilesRepository: ProfilesRepository;
};

const defaultDependencies: SessionDependencies = {
  getToken,
  getOrganizationContext: async () => ({}),
  sessionsRepository: convexSessionsRepository,
  profilesRepository: convexProfilesRepository,
};

async function getUserAndProfile(
  dependencies: SessionDependencies,
  token: string,
): Promise<{
  user: Awaited<ReturnType<SessionsRepository["getCurrent"]>>;
  profile: Awaited<ReturnType<ProfilesRepository["getCurrent"]>>;
}> {
  try {
    const [user, profile] = await Promise.all([
      dependencies.sessionsRepository.getCurrent(token),
      dependencies.profilesRepository.getCurrent(token),
    ]);
    return { user, profile };
  } catch (error) {
    if (!isNoAuthProviderError(error)) {
      throw error;
    }
    if (isClearlyExpiredJwtToken(token)) {
      return { user: null, profile: null };
    }
    throw new DomainError({
      code: "AUTH_CONFIGURATION_ERROR",
      message:
        "Active session token could not be matched to an auth provider. Verify Better Auth Convex issuer alignment.",
      status: 503,
    });
  }
}

function buildResolvedSession(
  token: string,
  user: NonNullable<Awaited<ReturnType<SessionsRepository["getCurrent"]>>>,
  profile: Awaited<ReturnType<ProfilesRepository["getCurrent"]>>,
  organizationContext: AuthOrganizationContext,
) {
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
      redId: profile?.developerId,
      organizationId: organizationContext.organizationId ?? user.organizationId ?? null,
      organizationSlug: organizationContext.organizationSlug ?? user.organizationSlug ?? null,
      organizationRole: organizationContext.organizationRole ?? user.organizationRole ?? null,
      organizationPermissions: organizationContext.organizationPermissions ?? user.organizationPermissions ?? [],
      isActive: user.isActive,
    },
  };
}

async function resolveOptionalSessionContext(
  dependencies: SessionDependencies,
): Promise<ResolvedSession | null> {
  let token: string | null;
  let organizationContext: AuthOrganizationContext;
  try {
    [token, organizationContext] = await Promise.all([
      dependencies.getToken(),
      dependencies.getOrganizationContext(),
    ]);
  } catch (error) {
    if (isMissingAuthTokenConfigurationError(error)) {
      throw new DomainError({
        code: "AUTH_CONFIGURATION_ERROR",
        message: "Better Auth token configuration is missing or unreachable.",
        status: 503,
      });
    }
    throw error;
  }
  if (!token) {
    return null;
  }

  let { user, profile } = await getUserAndProfile(dependencies, token);

  if (!user || user.isActive === false) {
    return null;
  }
  if (!profile) {
    profile = await dependencies.profilesRepository.ensureCurrent(token);
  }

  return buildResolvedSession(token, user, profile, organizationContext);
}

const getOptionalSessionContextCached = cache(async () => resolveOptionalSessionContext(defaultDependencies));

/**
 * WHY:   Every web-facing service needs the same authenticated context without duplicating token and profile lookups.
 * WHAT:  Resolves the optional current session, returning null when no active authenticated user exists.
 * HOW:   Reads the Better Auth Convex token, fetches the session projection and current profile, then builds SessionContext.
 */
export async function getOptionalSessionContext(
  dependencies: SessionDependencies = defaultDependencies,
): Promise<ResolvedSession | null> {
  if (dependencies === defaultDependencies) {
    return getOptionalSessionContextCached();
  }

  return resolveOptionalSessionContext(dependencies);
}

/**
 * WHY:   Protected domain services and routes should fail consistently when no authenticated session is available.
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

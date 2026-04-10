import { auth } from "@clerk/nextjs/server";
import { cache } from "react";
import {
  isClearlyExpiredJwtToken,
  isMissingClerkJwtTemplateError,
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

type SessionDependencies = {
  getToken: () => Promise<string | null>;
  getClerkContext: () => Promise<{
    organizationId?: string | null;
    organizationSlug?: string | null;
    organizationRole?: string | null;
    organizationPermissions?: string[];
  }>;
  sessionsRepository: SessionsRepository;
  profilesRepository: ProfilesRepository;
};

const clerkConvexJwtTemplate = process.env.CLERK_CONVEX_JWT_TEMPLATE?.trim() || "convex";

function toMissingClerkTemplateDomainError(template: string) {
  return new DomainError({
    code: "AUTH_CONFIGURATION_ERROR",
    message:
      `Clerk JWT template "${template}" was not found. Create a Clerk JWT template named "${template}" for Convex, ` +
      "or set CLERK_CONVEX_JWT_TEMPLATE to the name of your existing Clerk JWT template.",
    status: 503,
  });
}

function mapClerkTokenError(error: unknown) {
  if (isMissingClerkJwtTemplateError(error)) {
    return toMissingClerkTemplateDomainError(clerkConvexJwtTemplate);
  }

  return error;
}

const defaultDependencies: SessionDependencies = {
  getToken: async () => {
    const { getToken, userId } = await auth();
    if (!userId) {
      return null;
    }
    try {
      return (await getToken({ template: clerkConvexJwtTemplate })) ?? null;
    } catch (error) {
      throw mapClerkTokenError(error);
    }
  },
  getClerkContext: async () => {
    const { orgId, orgSlug, orgRole, orgPermissions } = await auth();
    return {
      organizationId: orgId ?? null,
      organizationSlug: orgSlug ?? null,
      organizationRole: orgRole ?? null,
      organizationPermissions: Array.isArray(orgPermissions) ? orgPermissions : [],
    };
  },
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
        "Active session token could not be matched to an auth provider. Verify CONVEX_SITE_URL issuer alignment.",
      status: 503,
    });
  }
}

function buildResolvedSession(
  token: string,
  user: NonNullable<Awaited<ReturnType<SessionsRepository["getCurrent"]>>>,
  profile: Awaited<ReturnType<ProfilesRepository["getCurrent"]>>,
  clerkContext: Awaited<ReturnType<SessionDependencies["getClerkContext"]>>,
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
      organizationId: clerkContext.organizationId ?? user.organizationId ?? null,
      organizationSlug: clerkContext.organizationSlug ?? user.organizationSlug ?? null,
      organizationRole: clerkContext.organizationRole ?? user.organizationRole ?? null,
      organizationPermissions: clerkContext.organizationPermissions ?? user.organizationPermissions ?? [],
      isActive: user.isActive,
    },
  };
}

async function resolveOptionalSessionContext(
  dependencies: SessionDependencies,
): Promise<ResolvedSession | null> {
  let token: string | null;
  let clerkContext: Awaited<ReturnType<SessionDependencies["getClerkContext"]>>;
  try {
    [token, clerkContext] = await Promise.all([
      dependencies.getToken(),
      dependencies.getClerkContext(),
    ]);
  } catch (error) {
    throw mapClerkTokenError(error);
  }
  if (!token) {
    return null;
  }

  const { user, profile } = await getUserAndProfile(dependencies, token);

  if (!user || user.isActive === false) {
    return null;
  }

  return buildResolvedSession(token, user, profile, clerkContext);
}

const getOptionalSessionContextCached = cache(async () => resolveOptionalSessionContext(defaultDependencies));

/**
 * WHY:   Every web-facing service needs the same authenticated context without duplicating token and profile lookups.
 * WHAT:  Resolves the optional current session, returning null when no active authenticated user exists.
 * HOW:   Reads the Convex auth token, fetches the session projection and current profile, then builds SessionContext.
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

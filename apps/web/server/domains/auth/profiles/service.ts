import { requireSessionContext, type ResolvedSession } from "@/server/auth/session";
import { DomainError } from "@/server/contracts/errors";
import type { ProfileSummary, UpdateProfileInput } from "@/server/contracts/profiles";
import { updateProfileInputSchema } from "@/server/contracts/profiles";
import { convexProfilesRepository, type ProfilesRepository } from "@/server/infrastructure/convex/profilesRepository";

type ProfilesServiceDependencies = {
  requireSession: () => Promise<ResolvedSession>;
  profilesRepository: ProfilesRepository;
};

const defaultDependencies: ProfilesServiceDependencies = {
  requireSession: requireSessionContext,
  profilesRepository: convexProfilesRepository,
};

/**
 * WHY:   The profile endpoint and workspace pages need one shared way to read the current profile.
 * WHAT:  Returns the current authenticated user's profile summary.
 * HOW:   Reuses the auth session context, which already enriches the request with profile data.
 */
export async function getCurrentProfileForCurrentUser(
  dependencies: ProfilesServiceDependencies = defaultDependencies,
): Promise<ProfileSummary | null> {
  const session = await dependencies.requireSession();
  return session.profile ?? dependencies.profilesRepository.getCurrent(session.token);
}

/**
 * WHY:   Workspace account management needs one validated profile-mutation path owned by the server layer.
 * WHAT:  Updates the current authenticated user's display name and username.
 * HOW:   Validates with Zod, then delegates to the Convex-backed profile repository using the current session token.
 */
export async function updateCurrentProfileForCurrentUser(
  input: unknown,
  dependencies: ProfilesServiceDependencies = defaultDependencies,
): Promise<ProfileSummary> {
  const parsed = updateProfileInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new DomainError({
      code: "INVALID_ARGUMENT",
      message: parsed.error.issues[0]?.message ?? "Invalid profile payload",
      status: 400,
    });
  }

  const session = await dependencies.requireSession();
  return dependencies.profilesRepository.updateCurrent(session.token, parsed.data as UpdateProfileInput);
}

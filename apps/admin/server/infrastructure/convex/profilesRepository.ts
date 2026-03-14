import { fetchQuery } from "convex/nextjs";
import { fetchMutation } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { ProfileSummary, UpdateProfileInput } from "@/server/contracts/profiles";

type UsersApiRefs = {
  getMyProfile: unknown;
  updateMyProfile: unknown;
};

const usersApi = (apiUnsafe["shared_logic/users/index"]) as UsersApiRefs;

/**
 * WHY:   Profile resolution must be swappable as the migration moves more logic out of Convex.
 * WHAT:  Repository contract for fetching the current user's profile summary.
 * HOW:   Implementations hide transport details and return the stable ProfileSummary DTO.
 */
export type ProfilesRepository = {
  getCurrent(token: string): Promise<ProfileSummary | null>;
  updateCurrent(token: string, input: UpdateProfileInput): Promise<ProfileSummary>;
};

/**
 * WHY:   The web gateway still reads profile data from Convex during the phased cutover.
 * WHAT:  Convex-backed profile repository implementation.
 * HOW:   Calls `shared_logic/users/index.getMyProfile` with the current token and returns the DTO unchanged.
 */
export const convexProfilesRepository: ProfilesRepository = {
  async getCurrent(token) {
    const profile = (await fetchQuery(usersApi.getMyProfile as never, {} as never, {
      token,
    })) as ProfileSummary | null;
    return profile;
  },
  async updateCurrent(token, input) {
    return fetchMutation(usersApi.updateMyProfile as never, input as never, {
      token,
    }) as Promise<ProfileSummary>;
  },
};

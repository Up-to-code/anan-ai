import { fetchMutation, fetchQuery } from "convex/nextjs";
import { usersApi } from "./api";
import type { ProfilesRepository } from "./types";

export type { ProfilesRepository } from "./types";

/**
 * WHY:   The web gateway still reads profile data from Convex during the phased cutover.
 * WHAT:  Convex-backed profile repository implementation.
 * HOW:   Calls `shared_logic/users/index.getMyProfile` with the current token and returns the DTO unchanged.
 */
export const convexProfilesRepository: ProfilesRepository = {
  async getCurrent(token) {
    const profile = (await fetchQuery(usersApi.getMyProfile as never, {} as never, {
      token,
    })) as Awaited<ReturnType<ProfilesRepository["getCurrent"]>>;
    return profile;
  },
  async updateCurrent(token, input) {
    return fetchMutation(usersApi.updateMyProfile as never, input as never, {
      token,
    }) as ReturnType<ProfilesRepository["updateCurrent"]>;
  },
};

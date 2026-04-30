import { mutationRef, queryRef } from "@anan/convex-adapters/repository";
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
    const profile = await queryRef<Awaited<ReturnType<ProfilesRepository["getCurrent"]>>>(
      token,
      usersApi.getMyProfile,
    );
    return profile;
  },
  async ensureCurrent(token) {
    return mutationRef<Awaited<ReturnType<ProfilesRepository["ensureCurrent"]>>>(
      token,
      usersApi.ensureMyProfile,
    );
  },
  async updateCurrent(token, input) {
    return mutationRef<Awaited<ReturnType<ProfilesRepository["updateCurrent"]>>>(
      token,
      usersApi.updateMyProfile,
      input,
    );
  },
};

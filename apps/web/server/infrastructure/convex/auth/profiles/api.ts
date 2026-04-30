import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type UsersApiRefs = {
  getMyProfile: unknown;
  ensureMyProfile: unknown;
  updateMyProfile: unknown;
};

export const usersApi = createRepositoryRefs<UsersApiRefs>(apiUnsafe, "shared_logic/users/index");

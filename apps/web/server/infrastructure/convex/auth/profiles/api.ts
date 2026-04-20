import { apiUnsafe } from "@/lib/convexApi";

export type UsersApiRefs = {
  getMyProfile: unknown;
  ensureMyProfile: unknown;
  updateMyProfile: unknown;
};

export const usersApi = apiUnsafe["shared_logic/users/index"] as UsersApiRefs;

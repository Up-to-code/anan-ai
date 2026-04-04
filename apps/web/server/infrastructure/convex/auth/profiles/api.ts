import { apiUnsafe } from "@/lib/convexApi";

export type UsersApiRefs = {
  getMyProfile: unknown;
  updateMyProfile: unknown;
};

export const usersApi = apiUnsafe["shared_logic/users/index"] as UsersApiRefs;

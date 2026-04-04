import { apiUnsafe } from "@/lib/convexApi";

export type SessionApiRefs = {
  getSessionUser: unknown;
};

export const sessionApi = apiUnsafe["shared_logic/users/session"] as SessionApiRefs;

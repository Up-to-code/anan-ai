import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type SessionApiRefs = {
  getSessionUser: unknown;
};

export const sessionApi = createRepositoryRefs<SessionApiRefs>(apiUnsafe, "shared_logic/users/session");

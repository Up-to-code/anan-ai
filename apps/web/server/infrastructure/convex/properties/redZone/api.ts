import { createRepositoryRefs } from "@anan/convex-adapters/repository";
import { apiUnsafe } from "@/lib/convexApi";

export type RedInternalRefs = {
  countPropertiesByRedId: unknown;
  listByRedId: unknown;
  getById: unknown;
  create: unknown;
  update: unknown;
  remove: unknown;
  publish: unknown;
};

export const redOverviewApi = createRepositoryRefs<RedInternalRefs>(apiUnsafe, "red_zone/overview");
export const redPropertiesApi = createRepositoryRefs<RedInternalRefs>(apiUnsafe, "red_zone/properties");

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

export const redOverviewApi = apiUnsafe["red_zone/overview"] as RedInternalRefs;
export const redPropertiesApi = apiUnsafe["red_zone/properties"] as RedInternalRefs;

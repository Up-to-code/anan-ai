import { apiUnsafe } from "@/lib/convexApi";

export type BrokerInternalRefs = {
  countPropertiesByBrokerId: unknown;
  listByBrokerId: unknown;
  getById: unknown;
  create: unknown;
  update: unknown;
  remove: unknown;
  publish: unknown;
};

export const brokerOverviewApi = apiUnsafe["broker_zone/overview"] as BrokerInternalRefs;
export const brokerPropertiesApi = apiUnsafe["broker_zone/properties"] as BrokerInternalRefs;

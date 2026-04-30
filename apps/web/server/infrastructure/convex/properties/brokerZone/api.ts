import { createRepositoryRefs } from "@anan/convex-adapters/repository";
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

export const brokerOverviewApi = createRepositoryRefs<BrokerInternalRefs>(apiUnsafe, "broker_zone/overview");
export const brokerPropertiesApi = createRepositoryRefs<BrokerInternalRefs>(apiUnsafe, "broker_zone/properties");

import type {
  BrokerOverviewSummary,
  CreatePropertyInput,
  PaginatedPropertiesResult,
  PropertyDetail,
  PropertyListFilters,
  PublishPropertyResult,
  UpdatePropertyInput,
} from "@/server/contracts/properties";

export type BrokerZoneRepository = {
  getOverview(token: string, brokerId: string): Promise<BrokerOverviewSummary>;
  listProperties(token: string, brokerId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
  createProperty(token: string, brokerId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(token: string, id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(token: string, id: string): Promise<void>;
  publishProperty(token: string, id: string): Promise<PublishPropertyResult>;
};

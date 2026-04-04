import type {
  CreatePropertyInput,
  DeveloperOverviewSummary,
  PaginatedPropertiesResult,
  PropertyDetail,
  PropertyListFilters,
  PublishPropertyResult,
  UpdatePropertyInput,
} from "@/server/contracts/properties";

export type RedZoneRepository = {
  getOverview(token: string, redId: string): Promise<DeveloperOverviewSummary>;
  listProperties(token: string, redId: string, filters: PropertyListFilters): Promise<PaginatedPropertiesResult>;
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
  createProperty(token: string, redId: string, input: CreatePropertyInput): Promise<string>;
  updateProperty(token: string, id: string, patch: UpdatePropertyInput): Promise<void>;
  deleteProperty(token: string, id: string): Promise<void>;
  publishProperty(token: string, id: string): Promise<PublishPropertyResult>;
};

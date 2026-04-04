import type { PropertyDetail } from "@/server/contracts/properties";

export type SharedProjectDetailsRepository = {
  getProperty(token: string, id: string): Promise<PropertyDetail | null>;
};

import { fetchMutation, fetchQuery } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { PaginationOptions, PaginationResult } from "@/server/infrastructure/convex/adminUsersRepository";

type PropertiesApiRefs = {
  listProperties: unknown;
  getProperty: unknown;
  createProperty: unknown;
  updateProperty: unknown;
  deleteProperty: unknown;
};

type RedApiRefs = {
  listREDs: unknown;
};

const propertiesApi = apiUnsafe["admin_zone/properties"] as PropertiesApiRefs;
const redApi = apiUnsafe["admin_zone/RED"] as RedApiRefs;

export type AdminPropertyRecord = {
  _id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  description: string;
  location?: string;
  area?: string;
  status?: "available" | "sold" | "reserved";
  bankId?: string;
  REDId?: string;
};

export type AdminRedRecord = {
  _id: string;
  name: string;
  slug: string;
};

export type PropertyMutationInput = {
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  sqft?: number;
  description: string;
  location?: string;
  area?: string;
  status?: "available" | "sold" | "reserved";
  bankId?: string;
  REDId?: string;
};

/**
 * WHY:   The admin properties surface needs one transport layer for list, edit, and delete flows.
 * WHAT:  Exposes auth-scoped property and developer readers plus property mutations.
 * HOW:   Delegates to `admin_zone/properties` and `admin_zone/RED`.
 */
export const convexAdminPropertiesRepository = {
  async list(
    token: string,
    input: { paginationOpts: PaginationOptions; status?: "available" | "sold" | "reserved"; REDId?: string },
  ) {
    return fetchQuery(propertiesApi.listProperties as never, input as never, { token }) as Promise<PaginationResult<AdminPropertyRecord>>;
  },
  async get(token: string, id: string) {
    return fetchQuery(propertiesApi.getProperty as never, { id } as never, { token }) as Promise<AdminPropertyRecord | null>;
  },
  async listReds(token: string) {
    return fetchQuery(redApi.listREDs as never, {} as never, { token }) as Promise<AdminRedRecord[]>;
  },
  async create(token: string, input: PropertyMutationInput) {
    return fetchMutation(propertiesApi.createProperty as never, input as never, { token }) as Promise<string>;
  },
  async update(token: string, input: Partial<PropertyMutationInput> & { id: string }) {
    await fetchMutation(propertiesApi.updateProperty as never, input as never, { token });
  },
  async remove(token: string, id: string) {
    await fetchMutation(propertiesApi.deleteProperty as never, { id } as never, { token });
  },
};

import { createRepositoryRefs, mutationRef, queryRef, voidMutationRef } from "@anan/convex-adapters/repository";
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

const propertiesApi = createRepositoryRefs<PropertiesApiRefs>(apiUnsafe, "admin_zone/properties");
const redApi = createRepositoryRefs<RedApiRefs>(apiUnsafe, "admin_zone/RED");

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
    return queryRef<PaginationResult<AdminPropertyRecord>>(token, propertiesApi.listProperties, input);
  },
  async get(token: string, id: string) {
    return queryRef<AdminPropertyRecord | null>(token, propertiesApi.getProperty, { id });
  },
  async listReds(token: string) {
    return queryRef<AdminRedRecord[]>(token, redApi.listREDs);
  },
  async create(token: string, input: PropertyMutationInput) {
    return mutationRef<string>(token, propertiesApi.createProperty, input);
  },
  async update(token: string, input: Partial<PropertyMutationInput> & { id: string }) {
    await voidMutationRef(token, propertiesApi.updateProperty, input);
  },
  async remove(token: string, id: string) {
    await voidMutationRef(token, propertiesApi.deleteProperty, { id });
  },
};

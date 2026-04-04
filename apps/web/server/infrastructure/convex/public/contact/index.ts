import { fetchMutation } from "convex/nextjs";
import { contactApi } from "./api";
import type { ContactRepository } from "./types";

export type { ContactRepository } from "./types";

export const convexContactRepository: ContactRepository = {
  async createInquiry(input) {
    return fetchMutation(contactApi.createContactInquiry as never, input as never) as ReturnType<ContactRepository["createInquiry"]>;
  },
};

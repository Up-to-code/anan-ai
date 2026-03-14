import { fetchMutation } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { CreateContactInquiryInput } from "@/server/contracts/contact";

type ContactApiRefs = {
  createContactInquiry: unknown;
};

const contactApi = apiUnsafe["public_zone/contact"] as ContactApiRefs;

export type ContactRepository = {
  createInquiry(input: CreateContactInquiryInput & { sourceIp?: string; userAgent?: string }): Promise<{ id: string }>;
};

export const convexContactRepository: ContactRepository = {
  async createInquiry(input) {
    return fetchMutation(contactApi.createContactInquiry as never, input as never) as Promise<{ id: string }>;
  },
};


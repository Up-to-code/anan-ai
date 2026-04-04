import { apiUnsafe } from "@/lib/convexApi";

export type ContactApiRefs = {
  createContactInquiry: unknown;
};

export const contactApi = apiUnsafe["public_zone/contact"] as ContactApiRefs;

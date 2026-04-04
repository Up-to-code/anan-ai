import type { CreateContactInquiryInput } from "@/server/contracts/contact";

export type ContactRepository = {
  createInquiry(input: CreateContactInquiryInput & { sourceIp?: string; userAgent?: string }): Promise<{ id: string }>;
};

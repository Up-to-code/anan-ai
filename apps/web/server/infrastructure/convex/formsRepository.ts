import { fetchMutation } from "convex/nextjs";
import { apiUnsafe } from "@/lib/convexApi";
import type { SubmitPublicFormInput } from "@/server/contracts/forms";

type FormsApiRefs = {
  submitForm: unknown;
};

const formsApi = apiUnsafe["public_zone/forms"] as FormsApiRefs;

export type FormsRepository = {
  submit(input: SubmitPublicFormInput & { sourceIp?: string; userAgent?: string }): Promise<{ id: string }>;
};

export const convexFormsRepository: FormsRepository = {
  async submit(input) {
    return fetchMutation(formsApi.submitForm as never, input as never) as Promise<{ id: string }>;
  },
};


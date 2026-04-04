import { apiUnsafe } from "@/lib/convexApi";

export type FormsApiRefs = {
  submitForm: unknown;
};

export const formsApi = apiUnsafe["public_zone/forms"] as FormsApiRefs;

import type { SubmitPublicFormInput } from "@/server/contracts/forms";

export type FormsRepository = {
  submit(input: SubmitPublicFormInput & { sourceIp?: string; userAgent?: string }): Promise<{ id: string }>;
};

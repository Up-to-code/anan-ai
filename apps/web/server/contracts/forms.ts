import { z } from "zod";

const earlyAccessUserTypeSchema = z.enum(["investor", "broker", "financial_broker", "developer"]);

export const earlyAccessFormDataSchema = z.object({
  name: z.string().trim().min(2).max(100),
  type: earlyAccessUserTypeSchema,
  phone: z.string().trim().min(7).max(30),
  email: z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    },
    z.string().trim().email().max(200).optional(),
  ),
});

export const submitPublicFormInputSchema = z.discriminatedUnion("formName", [
  z.object({
    formName: z.literal("early-access"),
    data: earlyAccessFormDataSchema,
  }),
]);

export type SubmitPublicFormInput = z.infer<typeof submitPublicFormInputSchema>;

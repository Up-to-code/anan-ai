import { z } from "zod";

export const orgApiClientInputSchema = z.object({
  name: z.string().trim().min(1, "Client name must be at least 1 character").max(120),
  phone: z.string().trim().min(1).max(40).optional(),
  email: z.string().trim().email("Client email must be valid").max(200).optional(),
  notes: z.string().trim().max(2000).optional(),
});

export const orgApiClientUpdateInputSchema = orgApiClientInputSchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  "Provide at least one client field to update",
);

export const orgApiPropertyInputSchema = z.object({
  title: z.string().trim().min(1, "Property title must be at least 1 character").max(200),
  address: z.string().trim().min(1, "Property address must be at least 1 character").max(300),
  price: z.number().finite().nonnegative(),
  beds: z.number().int().nonnegative(),
  baths: z.number().int().nonnegative(),
  description: z.string().trim().min(1, "Property description must be at least 1 character").max(5000),
  area: z.string().trim().max(200).optional(),
  location: z.string().trim().max(200).optional(),
});

export const orgApiPropertyUpdateInputSchema = orgApiPropertyInputSchema.partial().refine(
  (value) => Object.values(value).some((entry) => entry !== undefined),
  "Provide at least one property field to update",
);

export type OrgApiClientInput = z.infer<typeof orgApiClientInputSchema>;
export type OrgApiClientUpdateInput = z.infer<typeof orgApiClientUpdateInputSchema>;
export type OrgApiPropertyInput = z.infer<typeof orgApiPropertyInputSchema>;
export type OrgApiPropertyUpdateInput = z.infer<typeof orgApiPropertyUpdateInputSchema>;

export type OrgApiClientRecord = {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  notes?: string;
  brokerId?: string;
  redId?: string;
  createdAt: number;
  updatedAt: number;
};

export type OrgApiPropertyRecord = {
  id: string;
  title: string;
  address: string;
  price: number;
  beds: number;
  baths: number;
  description: string;
  area?: string;
  location?: string;
  brokerId?: string;
  redId?: string;
  status?: string;
  publicationState?: string;
};

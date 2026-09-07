import { z } from "zod";

export const careRecipientSchema = z.object({
  preferredName: z.string().min(1, "Preferred name is required").max(100, "Name must be 100 characters or less"),
  legalName: z.string().max(150, "Legal name must be 150 characters or less").optional().nullable(),
  birthDate: z.string().max(30).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email("Invalid email address").max(255).optional().nullable().or(z.literal("")),
  addressLine1: z.string().max(200).optional().nullable(),
  addressLine2: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().max(50).optional().nullable(),
  postalCode: z.string().max(20).optional().nullable(),
  careContext: z.string().max(5000, "Care context must be 5000 characters or less").optional().nullable(),
});

export type CareRecipientInput = z.infer<typeof careRecipientSchema>;

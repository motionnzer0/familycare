import { z } from "zod";

export const createMedicationSchema = z.object({
  name: z.string().min(1, "Medication name is required").max(200),
  dosage: z.string().max(100).optional().nullable(),
  instructions: z.string().max(500).optional().nullable(),
  frequency: z.string().max(100).optional().nullable(),
  schedule: z.string().max(200).optional().nullable(),
  prescribingProvider: z.string().max(200).optional().nullable(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date").optional().nullable(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date").optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  status: z.enum(["active", "paused", "discontinued", "archived"]).default("active"),
});

export const updateMedicationSchema = createMedicationSchema.partial();

export type CreateMedicationInput = z.infer<typeof createMedicationSchema>;
export type UpdateMedicationInput = z.infer<typeof updateMedicationSchema>;

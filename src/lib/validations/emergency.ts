import { z } from "zod";

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Contact name is required").max(100, "Contact name must be 100 characters or less"),
  phone: z.string().min(1, "Phone number is required").max(30, "Phone number must be 30 characters or less"),
  relationship: z.string().max(50, "Relationship must be 50 characters or less").optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const emergencyInfoSchema = z.object({
  preferredHospital: z.string().max(200, "Hospital name must be 200 characters or less").optional().nullable(),
  allergiesConditions: z.string().max(2000, "Allergies/conditions must be 2000 characters or less").optional().nullable(),
  insuranceInfo: z.string().max(2000, "Insurance details must be 2000 characters or less").optional().nullable(),
  additionalNotes: z.string().max(2000, "Additional notes must be 2000 characters or less").optional().nullable(),
});

export const EMERGENCY_SAFETY_BANNER_COPY =
  "For an emergency, call local emergency services.";

export const EMERGENCY_SAFETY_BANNER_SUBTEXT =
  "This summary is family-entered reference information for care coordination and does not replace professional emergency response.";

export const EMERGENCY_FIELD_PREAMBLE_COPY =
  "All details below are entered and maintained by your family. Confirm medical questions with a healthcare professional.";

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type EmergencyInfoInput = z.infer<typeof emergencyInfoSchema>;

import { z } from "zod";

export const emergencyContactSchema = z.object({
  name: z.string().min(1, "Contact name is required").max(100),
  phone: z.string().min(1, "Phone number is required").max(30),
  relationship: z.string().max(50).optional().nullable(),
  isPrimary: z.boolean().default(false),
  sortOrder: z.number().int().default(0),
});

export const emergencyInfoSchema = z.object({
  preferredHospital: z.string().max(200).optional().nullable(),
  allergiesConditions: z.string().max(2000).optional().nullable(),
  insuranceInfo: z.string().max(2000).optional().nullable(),
  additionalNotes: z.string().max(2000).optional().nullable(),
});

export const EMERGENCY_SAFETY_BANNER_COPY =
  "For an emergency, call 911 or local emergency services immediately. This workspace is a shared family reference tool and does not provide emergency response, medical dispatch, or clinical advice.";

export const EMERGENCY_FIELD_PREAMBLE_COPY =
  "All details below are entered and maintained by your family. Confirm medical questions with a healthcare professional.";

export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type EmergencyInfoInput = z.infer<typeof emergencyInfoSchema>;

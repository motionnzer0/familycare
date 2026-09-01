import { z } from "zod";

export const onboardingSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required").max(100),
  careRecipientPreferredName: z.string().min(1, "Care recipient's preferred name is required").max(100),
  timezone: z.string().default("America/New_York"),
  // Step 3: Emergency contact (optional)
  emergencyContact: z
    .object({
      name: z.string().min(1),
      phone: z.string().min(1),
      relationship: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // Step 4: First task (optional)
  initialTask: z
    .object({
      title: z.string().min(1),
      dueDate: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
  // Step 5: First appointment (optional)
  initialAppointment: z
    .object({
      title: z.string().min(1),
      date: z.string().min(1),
      startTime: z.string().optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

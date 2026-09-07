import { z } from "zod";

export const onboardingSchema = z.object({
  workspaceName: z.string().min(1, "Workspace name is required").max(100),
  careRecipientPreferredName: z.string().min(1, "Care recipient's preferred name is required").max(100),
  timezone: z.string().default("America/New_York"),
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;


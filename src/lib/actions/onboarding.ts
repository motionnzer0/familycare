"use server";

import { onboardingSchema, OnboardingInput } from "@/lib/validations/onboarding";
import { createWorkspaceAction } from "./workspace";
import { ActionResult } from "./auth";

export async function completeOnboardingAction(
  input: OnboardingInput
): Promise<ActionResult<{ workspaceId: string }>> {
  const parsed = onboardingSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid onboarding details",
    };
  }

  return createWorkspaceAction({
    name: parsed.data.workspaceName,
    careRecipientPreferredName: parsed.data.careRecipientPreferredName,
    timezone: parsed.data.timezone || "America/New_York",
  });
}


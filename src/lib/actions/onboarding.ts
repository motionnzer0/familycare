"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { onboardingSchema, OnboardingInput } from "@/lib/validations/onboarding";
import { createWorkspaceAction } from "./workspace";
import { ActionResult } from "./auth";
import { logTimelineEvent } from "@/lib/timeline";

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

  // 1. Create workspace, care recipient, and emergency record
  const wsResult = await createWorkspaceAction({
    name: parsed.data.workspaceName,
    careRecipientPreferredName: parsed.data.careRecipientPreferredName,
    timezone: parsed.data.timezone || "America/New_York",
  });

  if (!wsResult.success || !wsResult.data) {
    return { success: false, error: wsResult.error || "Failed to create workspace" };
  }

  const workspaceId = wsResult.data.workspaceId;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User session not found" };
  }

  // 2. Optional: Add emergency contact if provided
  if (parsed.data.emergencyContact?.name && parsed.data.emergencyContact?.phone) {
    const { data: emergencyInfo } = await supabase
      .from("emergency_info")
      .select("id")
      .eq("workspace_id", workspaceId)
      .single();

    if (emergencyInfo) {
      await supabase.from("emergency_contacts").insert({
        emergency_info_id: emergencyInfo.id,
        workspace_id: workspaceId,
        name: parsed.data.emergencyContact.name,
        phone: parsed.data.emergencyContact.phone,
        relationship: parsed.data.emergencyContact.relationship || null,
        is_primary: true,
        sort_order: 0,
      });

      await logTimelineEvent(supabase, {
        workspaceId,
        actorId: user.id,
        action: "created",
        targetType: "emergency_info",
        targetId: emergencyInfo.id,
        targetTitle: `Emergency Contact: ${parsed.data.emergencyContact.name}`,
      });
    }
  }

  // 3. Optional: Add first task if provided
  let initialTaskId: string | null = null;
  if (parsed.data.initialTask?.title) {
    const { data: task } = await supabase
      .from("tasks")
      .insert({
        workspace_id: workspaceId,
        title: parsed.data.initialTask.title,
        due_date: parsed.data.initialTask.dueDate || null,
        created_by: user.id,
        status: "open",
      })
      .select()
      .single();

    if (task) {
      initialTaskId = task.id;
      await logTimelineEvent(supabase, {
        workspaceId,
        actorId: user.id,
        action: "created",
        targetType: "task",
        targetId: task.id,
        targetTitle: task.title,
      });
    }
  }

  // 4. Optional: Add first appointment if provided
  if (parsed.data.initialAppointment?.title && parsed.data.initialAppointment?.date) {
    const { data: appointment } = await supabase
      .from("appointments")
      .insert({
        workspace_id: workspaceId,
        title: parsed.data.initialAppointment.title,
        date: parsed.data.initialAppointment.date,
        start_time: parsed.data.initialAppointment.startTime || null,
        related_task_id: initialTaskId,
        created_by: user.id,
        status: "scheduled",
      })
      .select()
      .single();

    if (appointment) {
      await logTimelineEvent(supabase, {
        workspaceId,
        actorId: user.id,
        action: "created",
        targetType: "appointment",
        targetId: appointment.id,
        targetTitle: appointment.title,
      });
    }
  }

  revalidatePath("/", "layout");
  redirect("/today");
}

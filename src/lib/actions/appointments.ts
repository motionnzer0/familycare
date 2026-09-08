"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createAppointmentSchema,
  CreateAppointmentInput,
  UpdateAppointmentInput,
} from "@/lib/validations/appointment";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Appointment, AppointmentStatus } from "@/lib/types";

/**
 * Creates a new appointment in the active workspace.
 */
export async function createAppointmentAction(
  input: CreateAppointmentInput
): Promise<ActionResult<Appointment>> {
  const parsed = createAppointmentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid appointment details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const workspaceId = context.workspace.id;

  const allowed = checkPermission(context.userRole, "appointment", "create");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can create appointments" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "User session not found" };

  const { data: appointment, error } = await supabase
    .from("appointments")
    .insert({
      workspace_id: workspaceId,
      title: parsed.data.title,
      date: parsed.data.date,
      start_time: parsed.data.startTime || null,
      end_time: parsed.data.endTime || null,
      location: parsed.data.location || null,
      provider_contact: parsed.data.providerContact || null,
      attendees: parsed.data.attendees || null,
      details: parsed.data.details || null,
      related_task_id: parsed.data.relatedTaskId || null,
      status: "scheduled",
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !appointment) {
    return { success: false, error: error?.message || "Failed to create appointment" };
  }

  await logTimelineEvent(supabase, {
    workspaceId,
    actorId: user.id,
    action: "created",
    targetType: "appointment",
    targetId: appointment.id,
    targetTitle: appointment.title,
  });

  revalidatePath("/today");
  revalidatePath("/calendar");
  return { success: true, data: appointment as Appointment };
}

/**
 * Updates an appointment.
 */
export async function updateAppointmentAction(
  appointmentId: string,
  input: UpdateAppointmentInput
): Promise<ActionResult<Appointment>> {
  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const allowed = checkPermission(context.userRole, "appointment", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can edit appointments" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.date !== undefined) updateData.date = input.date;
  if (input.startTime !== undefined) updateData.start_time = input.startTime;
  if (input.endTime !== undefined) updateData.end_time = input.endTime;
  if (input.location !== undefined) updateData.location = input.location;
  if (input.providerContact !== undefined) updateData.provider_contact = input.providerContact;
  if (input.attendees !== undefined) updateData.attendees = input.attendees;
  if (input.details !== undefined) updateData.details = input.details;
  if (input.relatedTaskId !== undefined) updateData.related_task_id = input.relatedTaskId;
  if (input.status !== undefined) updateData.status = input.status;

  const { data: updated, error } = await supabase
    .from("appointments")
    .update(updateData)
    .eq("id", appointmentId)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (error || !updated) {
    return { success: false, error: error?.message || "Failed to update appointment" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "appointment",
    targetId: appointmentId,
    targetTitle: updated.title,
  });

  revalidatePath("/today");
  revalidatePath("/calendar");
  return { success: true, data: updated as Appointment };
}

/**
 * Updates appointment status (e.g. completed, cancelled, scheduled).
 */
export async function updateAppointmentStatusAction(
  appointmentId: string,
  status: AppointmentStatus
): Promise<ActionResult<Appointment>> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "appointment", "update");
  if (!allowed) return { success: false, error: "Permission denied" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: updated, error } = await supabase
    .from("appointments")
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (error || !updated) return { success: false, error: error?.message || "Failed to update status" };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: status === "completed" ? "completed" : status === "cancelled" ? "cancelled" : "updated",
    targetType: "appointment",
    targetId: appointmentId,
    targetTitle: updated.title,
  });

  revalidatePath("/today");
  revalidatePath("/calendar");
  return { success: true, data: updated as Appointment };
}

/**
 * Soft deletes an appointment.
 */
export async function deleteAppointmentAction(appointmentId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "appointment", "delete");
  if (!allowed) return { success: false, error: "Permission denied" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("appointments")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", appointmentId)
    .eq("workspace_id", context.workspace.id);

  if (error) return { success: false, error: error.message };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "appointment",
    targetId: appointmentId,
  });

  revalidatePath("/today");
  revalidatePath("/calendar");
  return { success: true };
}

/**
 * Fetches workspace appointments for the /calendar view.
 */
export async function getWorkspaceAppointments(workspaceId: string): Promise<Appointment[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }

  return (data || []) as Appointment[];
}

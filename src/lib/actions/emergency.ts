"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  emergencyContactSchema,
  emergencyInfoSchema,
  EmergencyContactInput,
  EmergencyInfoInput,
} from "@/lib/validations/emergency";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { EmergencyInfo, EmergencyContact, Role } from "@/lib/types";

/**
 * Fetches emergency information and contacts for the active workspace.
 */
export async function getEmergencyData(workspaceId: string): Promise<{
  info: EmergencyInfo | null;
  contacts: EmergencyContact[];
}> {
  const supabase = await createServerSupabaseClient();

  const [infoRes, contactsRes] = await Promise.all([
    supabase
      .from("emergency_info")
      .select("*")
      .eq("workspace_id", workspaceId)
      .limit(1)
      .single(),
    supabase
      .from("emergency_contacts")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  return {
    info: (infoRes.data as EmergencyInfo) || null,
    contacts: (contactsRes.data || []) as EmergencyContact[],
  };
}

/**
 * Updates structured emergency text details (Hospital, allergies, insurance, notes).
 * Owner / Coordinator only.
 */
export async function updateEmergencyInfoAction(
  input: EmergencyInfoInput
): Promise<ActionResult<EmergencyInfo>> {
  const parsed = emergencyInfoSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid emergency details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "emergency", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can edit emergency information" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const updatePayload = {
    preferred_hospital: parsed.data.preferredHospital || null,
    allergies_conditions: parsed.data.allergiesConditions || null,
    insurance_info: parsed.data.insuranceInfo || null,
    additional_notes: parsed.data.additionalNotes || null,
    last_reviewed_at: new Date().toISOString(),
    last_reviewed_by: user.id,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("emergency_info")
    .update(updatePayload)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (error || !updated) {
    return { success: false, error: error?.message || "Failed to update emergency information" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "emergency_info",
    targetId: updated.id,
    targetTitle: "Emergency Reference Details",
  });

  revalidatePath("/emergency");
  revalidatePath("/today");
  return { success: true, data: updated as EmergencyInfo };
}

/**
 * Adds an emergency contact.
 */
export async function addEmergencyContactAction(
  input: EmergencyContactInput
): Promise<ActionResult<EmergencyContact>> {
  const parsed = emergencyContactSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid contact information",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "emergency", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can add emergency contacts" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Fetch or create emergency_info container
  let { data: info } = await supabase
    .from("emergency_info")
    .select("id")
    .eq("workspace_id", context.workspace.id)
    .single();

  if (!info) {
    const { data: newInfo } = await supabase
      .from("emergency_info")
      .insert({ workspace_id: context.workspace.id })
      .select("id")
      .single();
    info = newInfo;
  }

  if (!info) {
    return { success: false, error: "Emergency container not initialized" };
  }

  const { data: contact, error } = await supabase
    .from("emergency_contacts")
    .insert({
      emergency_info_id: info.id,
      workspace_id: context.workspace.id,
      name: parsed.data.name,
      phone: parsed.data.phone,
      relationship: parsed.data.relationship || null,
      is_primary: parsed.data.isPrimary || false,
      sort_order: parsed.data.sortOrder || 0,
    })
    .select()
    .single();

  if (error || !contact) {
    return { success: false, error: error?.message || "Failed to add emergency contact" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "emergency_info",
    targetId: contact.id,
    targetTitle: `Emergency Contact: ${contact.name}`,
  });

  revalidatePath("/emergency");
  revalidatePath("/today");
  return { success: true, data: contact as EmergencyContact };
}

/**
 * Deletes an emergency contact.
 */
export async function deleteEmergencyContactAction(contactId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "emergency", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can remove emergency contacts" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("emergency_contacts")
    .delete()
    .eq("id", contactId)
    .eq("workspace_id", context.workspace.id);

  if (error) return { success: false, error: error.message };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "emergency_info",
    targetId: contactId,
    targetTitle: "Emergency Contact",
  });

  revalidatePath("/emergency");
  revalidatePath("/today");
  return { success: true };
}

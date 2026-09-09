"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createMedicationSchema,
  updateMedicationSchema,
  CreateMedicationInput,
  UpdateMedicationInput,
} from "@/lib/validations/medication";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Medication, MedicationStatus, Role } from "@/lib/types";

/**
 * Fetches workspace medications.
 */
export async function getWorkspaceMedications(workspaceId: string): Promise<Medication[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("medications")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("status", { ascending: true }) // active first
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching medications:", error);
    return [];
  }

  return (data || []).map((row) => ({
    ...row,
    dosage: row.form_strength || row.dosage || null,
    prescribing_provider: row.prescriber_pharmacy || row.prescribing_provider || null,
    notes: row.note || row.notes || null,
  })) as Medication[];
}

/**
 * Creates a medication entry (Owner/Coordinator only).
 */
export async function createMedicationAction(
  input: CreateMedicationInput
): Promise<ActionResult<Medication>> {
  const parsed = createMedicationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid medication details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "medication", "create");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can add medications" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const dbStatus =
    parsed.data.status === "archived" || parsed.data.status === "discontinued"
      ? "archived"
      : "active";

  const { data: med, error } = await supabase
    .from("medications")
    .insert({
      workspace_id: context.workspace.id,
      name: parsed.data.name,
      form_strength: parsed.data.dosage || null,
      instructions: parsed.data.instructions || (parsed.data.frequency ? `${parsed.data.frequency}${parsed.data.schedule ? ` (${parsed.data.schedule})` : ""}` : null),
      prescriber_pharmacy: parsed.data.prescribingProvider || null,
      note: parsed.data.notes || null,
      status: dbStatus,
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !med) {
    return { success: false, error: error?.message || "Failed to create medication record" };
  }

  const mappedMed: Medication = {
    ...med,
    dosage: med.form_strength,
    prescribing_provider: med.prescriber_pharmacy,
    notes: med.note,
  };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "medication",
    targetId: med.id,
    targetTitle: `${med.name} (${mappedMed.dosage || "standard"})`,
  });

  revalidatePath("/medications");
  revalidatePath("/today");
  return { success: true, data: mappedMed };
}

/**
 * Updates a medication entry.
 */
export async function updateMedicationAction(
  medicationId: string,
  input: UpdateMedicationInput
): Promise<ActionResult<Medication>> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "medication", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can edit medications" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.name !== undefined) updateData.name = input.name;
  if (input.dosage !== undefined) updateData.form_strength = input.dosage;
  if (input.instructions !== undefined) updateData.instructions = input.instructions;
  if (input.prescribingProvider !== undefined) updateData.prescriber_pharmacy = input.prescribingProvider;
  if (input.notes !== undefined) updateData.note = input.notes;
  if (input.status !== undefined) {
    updateData.status =
      input.status === "archived" || input.status === "discontinued" ? "archived" : "active";
  }

  const { data: updated, error } = await supabase
    .from("medications")
    .update(updateData)
    .eq("id", medicationId)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (error || !updated) {
    return { success: false, error: error?.message || "Failed to update medication" };
  }

  const mappedMed: Medication = {
    ...updated,
    dosage: updated.form_strength,
    prescribing_provider: updated.prescriber_pharmacy,
    notes: updated.note,
  };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "medication",
    targetId: medicationId,
    targetTitle: updated.name,
  });

  revalidatePath("/medications");
  revalidatePath("/today");
  return { success: true, data: mappedMed };
}

/**
 * Soft deletes a medication record.
 */
export async function deleteMedicationAction(medicationId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "medication", "delete");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can delete medications" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("medications")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", medicationId)
    .eq("workspace_id", context.workspace.id);

  if (error) return { success: false, error: error.message };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "medication",
    targetId: medicationId,
    targetTitle: "Medication",
  });

  revalidatePath("/medications");
  revalidatePath("/today");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { careRecipientSchema, CareRecipientInput } from "@/lib/validations/care";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { CareRecipient } from "@/lib/types";

/**
 * Updates the care recipient profile details.
 * Owner / Coordinator only.
 */
export async function updateCareRecipientAction(
  input: CareRecipientInput
): Promise<ActionResult<CareRecipient>> {
  const parsed = careRecipientSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid care profile details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "care_recipient", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can edit the care profile" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const updatePayload: Record<string, unknown> = {
    preferred_name: parsed.data.preferredName.trim(),
    legal_name: parsed.data.legalName?.trim() || null,
    birth_date: parsed.data.birthDate || null,
    phone: parsed.data.phone?.trim() || null,
    email: parsed.data.email?.trim() || null,
    address_line1: parsed.data.addressLine1?.trim() || null,
    address_line2: parsed.data.addressLine2?.trim() || null,
    city: parsed.data.city?.trim() || null,
    state: parsed.data.state?.trim() || null,
    postal_code: parsed.data.postalCode?.trim() || null,
    care_context: parsed.data.careContext?.trim() || null,
    updated_at: new Date().toISOString(),
  };

  const { data: updated, error } = await supabase
    .from("care_recipients")
    .update(updatePayload)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (error || !updated) {
    return { success: false, error: error?.message || "Failed to update care profile" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "care_recipient",
    targetId: updated.id,
    targetTitle: `Care Profile: ${updated.preferred_name}`,
  });

  revalidatePath("/care");
  revalidatePath("/settings");
  revalidatePath("/today");
  revalidatePath("/", "layout");

  return { success: true, data: updated as CareRecipient };
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { getActiveWorkspaceContext } from "./workspace";
import { ActionResult } from "./auth";

export interface UpdateSettingsInput {
  workspaceName?: string;
  timezone?: string;
  careRecipientPreferredName?: string;
  careRecipientBirthDate?: string | null;
  careRecipientPhone?: string | null;
  careContext?: string | null;
}

/**
 * Updates workspace identity and care recipient settings.
 */
export async function updateWorkspaceSettingsAction(
  input: UpdateSettingsInput
): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "workspace", "update");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can edit workspace settings" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // 1. Update workspace details if provided
  if (input.workspaceName || input.timezone) {
    const wsUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.workspaceName) wsUpdate.name = input.workspaceName.trim();
    if (input.timezone) wsUpdate.timezone = input.timezone;

    const { error: wsError } = await supabase
      .from("workspaces")
      .update(wsUpdate)
      .eq("id", context.workspace.id);

    if (wsError) return { success: false, error: wsError.message };
  }

  // 2. Update care recipient details if provided
  if (
    input.careRecipientPreferredName !== undefined ||
    input.careRecipientBirthDate !== undefined ||
    input.careRecipientPhone !== undefined ||
    input.careContext !== undefined
  ) {
    const crUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (input.careRecipientPreferredName) crUpdate.preferred_name = input.careRecipientPreferredName.trim();
    if (input.careRecipientBirthDate !== undefined) crUpdate.birth_date = input.careRecipientBirthDate;
    if (input.careRecipientPhone !== undefined) crUpdate.phone = input.careRecipientPhone;
    if (input.careContext !== undefined) crUpdate.care_context = input.careContext;

    const { error: crError } = await supabase
      .from("care_recipients")
      .update(crUpdate)
      .eq("workspace_id", context.workspace.id);

    if (crError) return { success: false, error: crError.message };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "workspace",
    targetId: context.workspace.id,
    targetTitle: "Workspace Settings",
  });

  revalidatePath("/", "layout");
  return { success: true };
}

/**
 * Soft deletes the workspace (Owner only / D-21).
 * Immediately revokes access; starts 30-day purge grace period.
 */
export async function deleteWorkspaceAction(): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "workspace", "delete");
  if (!allowed) {
    return { success: false, error: "Only the workspace owner can delete this workspace" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Set deleted_at timestamp
  const now = new Date().toISOString();
  const { error } = await supabase
    .from("workspaces")
    .update({
      deleted_at: now,
      updated_at: now,
    })
    .eq("id", context.workspace.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "workspace",
    targetId: context.workspace.id,
    targetTitle: context.workspace.name,
  });

  // Clear active workspace cookie
  const cookieStore = cookies();
  cookieStore.delete("familycare_active_workspace_id");

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

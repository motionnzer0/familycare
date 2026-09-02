"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createWorkspaceSchema, CreateWorkspaceInput } from "@/lib/validations/workspace";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { Role, Workspace, CareRecipient, WorkspaceMember } from "@/lib/types";

const ACTIVE_WORKSPACE_COOKIE = "familycare_active_workspace_id";

export interface WorkspaceContext {
  workspace: Workspace;
  membership: WorkspaceMember;
  careRecipient: CareRecipient;
  userRole: Role;
}

/**
 * Retrieves the user's active workspace context.
 */
export async function getActiveWorkspaceContext(): Promise<WorkspaceContext | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const cookieStore = cookies();
  const activeWorkspaceId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value;

  // 1. Fetch user's active memberships
  let membershipQuery = supabase
    .from("workspace_members")
    .select("*, workspaces(*, care_recipients(*))")
    .eq("user_id", user.id)
    .eq("status", "active");

  if (activeWorkspaceId) {
    membershipQuery = membershipQuery.eq("workspace_id", activeWorkspaceId);
  }

  const { data: memberships, error } = await membershipQuery.limit(1);

  if (error || !memberships || memberships.length === 0) {
    // If specific active ID failed, try getting any active workspace for user
    if (activeWorkspaceId) {
      const { data: fallbackMemberships } = await supabase
        .from("workspace_members")
        .select("*, workspaces(*, care_recipients(*))")
        .eq("user_id", user.id)
        .eq("status", "active")
        .limit(1);

      if (fallbackMemberships && fallbackMemberships.length > 0) {
        const m = fallbackMemberships[0];
        const ws = m.workspaces as unknown as Workspace;
        const cr = (m.workspaces as unknown as { care_recipients: CareRecipient[] })?.care_recipients?.[0];

        return {
          workspace: ws,
          membership: m,
          careRecipient: cr,
          userRole: m.role as Role,
        };
      }
    }
    return null;
  }

  const m = memberships[0];
  const ws = m.workspaces as unknown as Workspace;
  const cr = (m.workspaces as unknown as { care_recipients: CareRecipient[] })?.care_recipients?.[0];

  return {
    workspace: ws,
    membership: m,
    careRecipient: cr,
    userRole: m.role as Role,
  };
}

/**
 * Creates a new workspace and initializes care recipient and emergency records.
 */
export async function createWorkspaceAction(
  input: CreateWorkspaceInput
): Promise<ActionResult<{ workspaceId: string }>> {
  const parsed = createWorkspaceSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid workspace data",
    };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  // 1. Insert workspace
  const { data: workspace, error: wsError } = await supabase
    .from("workspaces")
    .insert({
      name: parsed.data.name,
      timezone: parsed.data.timezone || "America/New_York",
      owner_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (wsError || !workspace) {
    return { success: false, error: wsError?.message || "Failed to create workspace" };
  }

  // 2. Add creator as Owner in workspace_members
  const { error: memberError } = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: user.id,
    role: "owner",
    display_name: user.user_metadata?.full_name || "Owner",
    status: "active",
    joined_at: new Date().toISOString(),
  });

  if (memberError) {
    return { success: false, error: memberError.message };
  }

  // 3. Create 1:1 Care Recipient record
  const { error: crError } = await supabase.from("care_recipients").insert({
    workspace_id: workspace.id,
    preferred_name: parsed.data.careRecipientPreferredName,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  if (crError) {
    return { success: false, error: crError.message };
  }

  // 4. Create empty 1:1 Emergency Information container
  await supabase.from("emergency_info").insert({
    workspace_id: workspace.id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  // 5. Log creation to immutable timeline
  await logTimelineEvent(supabase, {
    workspaceId: workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "workspace",
    targetId: workspace.id,
    targetTitle: workspace.name,
  });

  // 6. Set active workspace cookie
  const cookieStore = cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspace.id, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  revalidatePath("/", "layout");
  return {
    success: true,
    data: { workspaceId: workspace.id },
  };
}

/**
 * Sets the active workspace context for multi-workspace users.
 */
export async function setActiveWorkspaceAction(workspaceId: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Authentication required" };
  }

  // Verify active membership
  const { data, error } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "active")
    .single();

  if (error || !data) {
    return { success: false, error: "Access to workspace denied" };
  }

  const cookieStore = cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/", "layout");
  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { randomBytes } from "crypto";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  inviteMemberSchema,
  updateMemberRoleSchema,
  InviteMemberInput,
  UpdateMemberRoleInput,
} from "@/lib/validations/team";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Role, WorkspaceMember, WorkspaceInvitation } from "@/lib/types";

/**
 * Creates an invitation for a caregiver.
 */
export async function inviteMemberAction(
  input: InviteMemberInput
): Promise<ActionResult<{ invitationUrl: string; token: string }>> {
  const parsed = inviteMemberSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid invitation details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const allowed = checkPermission(context.userRole, "member", "invite");
  if (!allowed) {
    return { success: false, error: "Only owners and coordinators can invite members" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Check if active member with this email already exists
  // Look up user_profiles or workspace_members
  const email = parsed.data.email.toLowerCase().trim();

  // Generate secure 32-byte token and 7-day expiration
  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error } = await supabase
    .from("workspace_invitations")
    .insert({
      workspace_id: context.workspace.id,
      email,
      role: parsed.data.role,
      invited_by: user.id,
      token,
      status: "pending",
      expires_at: expiresAt,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !invitation) {
    return { success: false, error: error?.message || "Failed to create invitation" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "workspace_member",
    targetId: invitation.id,
    targetTitle: `Invitation for ${email} as ${parsed.data.role}`,
  });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const invitationUrl = `${appUrl}/invite/${token}`;

  revalidatePath("/team");
  return {
    success: true,
    data: { invitationUrl, token },
  };
}

/**
 * Accepts a workspace invitation using a token.
 */
export async function acceptInvitationAction(
  token: string
): Promise<ActionResult<{ workspaceId: string }>> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "You must be logged in to accept an invitation" };
  }

  // 1. Fetch pending invitation
  const { data: invitation, error } = await supabase
    .from("workspace_invitations")
    .select("*, workspaces(*)")
    .eq("token", token)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .single();

  if (error || !invitation) {
    return {
      success: false,
      error: "This invitation is invalid, has expired, or has already been used.",
    };
  }

  const workspaceId = invitation.workspace_id;

  // 2. Insert or reactivate membership
  const { data: existingMember } = await supabase
    .from("workspace_members")
    .select("id, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .single();

  if (existingMember) {
    if (existingMember.status === "active") {
      // Already active, just mark invitation accepted
      await supabase
        .from("workspace_invitations")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", invitation.id);

      return { success: true, data: { workspaceId } };
    }

    // Reactivate previously removed member with invitation's role
    await supabase
      .from("workspace_members")
      .update({
        role: invitation.role,
        status: "active",
        display_name: user.user_metadata?.full_name || "Caregiver",
        joined_at: new Date().toISOString(),
      })
      .eq("id", existingMember.id);
  } else {
    // Insert new member
    const { error: insertError } = await supabase.from("workspace_members").insert({
      workspace_id: workspaceId,
      user_id: user.id,
      role: invitation.role,
      display_name: user.user_metadata?.full_name || "Caregiver",
      status: "active",
      joined_at: new Date().toISOString(),
    });

    if (insertError) {
      return { success: false, error: insertError.message };
    }
  }

  // 3. Mark invitation accepted
  await supabase
    .from("workspace_invitations")
    .update({ status: "accepted", accepted_at: new Date().toISOString() })
    .eq("id", invitation.id);

  // 4. Log timeline event
  await logTimelineEvent(supabase, {
    workspaceId,
    actorId: user.id,
    action: "joined",
    targetType: "workspace_member",
    targetId: user.id,
    targetTitle: `${user.user_metadata?.full_name || "Caregiver"} joined the team`,
  });

  // 5. Set active workspace cookie
  const cookieStore = cookies();
  cookieStore.set("familycare_active_workspace_id", workspaceId, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  revalidatePath("/", "layout");
  return { success: true, data: { workspaceId } };
}

/**
 * Updates a member's role (Owner or Coordinator only).
 */
export async function updateMemberRoleAction(
  input: UpdateMemberRoleInput
): Promise<ActionResult> {
  const parsed = updateMemberRoleSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid role update data" };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "member", "update");
  if (!allowed) {
    return { success: false, error: "You do not have permission to manage member roles" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Fetch target member
  const { data: targetMember, error: fetchError } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("id", parsed.data.memberId)
    .eq("workspace_id", context.workspace.id)
    .single();

  if (fetchError || !targetMember) {
    return { success: false, error: "Member not found" };
  }

  // Prevent modifying workspace owner role directly here
  if (targetMember.role === "owner") {
    return { success: false, error: "Cannot change the workspace owner's role directly" };
  }

  const { error: updateError } = await supabase
    .from("workspace_members")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.memberId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "workspace_member",
    targetId: targetMember.user_id,
    targetTitle: `${targetMember.display_name} changed to ${parsed.data.role}`,
  });

  revalidatePath("/team");
  return { success: true };
}

/**
 * Removes a member from the workspace (immediate access revocation).
 */
export async function removeMemberAction(memberId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "member", "delete");
  if (!allowed) {
    return { success: false, error: "Only workspace owners can remove members" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: targetMember } = await supabase
    .from("workspace_members")
    .select("*")
    .eq("id", memberId)
    .eq("workspace_id", context.workspace.id)
    .single();

  if (!targetMember) {
    return { success: false, error: "Member not found" };
  }

  if (targetMember.role === "owner") {
    return { success: false, error: "Cannot remove the workspace owner" };
  }

  // Set status = removed (immediate access revocation per D-21)
  const { error } = await supabase
    .from("workspace_members")
    .update({ status: "removed" })
    .eq("id", memberId);

  if (error) {
    return { success: false, error: error.message };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "removed",
    targetType: "workspace_member",
    targetId: targetMember.user_id,
    targetTitle: `${targetMember.display_name} removed from team`,
  });

  revalidatePath("/team");
  return { success: true };
}

/**
 * Fetches workspace members and pending invitations for /team view.
 */
export async function getWorkspaceTeam(workspaceId: string): Promise<{
  members: WorkspaceMember[];
  invitations: WorkspaceInvitation[];
}> {
  const supabase = await createServerSupabaseClient();

  const [membersRes, invitesRes] = await Promise.all([
    supabase
      .from("workspace_members")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "active")
      .order("joined_at", { ascending: true }),
    supabase
      .from("workspace_invitations")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false }),
  ]);

  return {
    members: (membersRes.data || []) as WorkspaceMember[],
    invitations: (invitesRes.data || []) as WorkspaceInvitation[],
  };
}

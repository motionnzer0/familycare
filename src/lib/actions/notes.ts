"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createNoteSchema,
  updateNoteSchema,
  CreateNoteInput,
  UpdateNoteInput,
} from "@/lib/validations/note";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Note, Role } from "@/lib/types";

/**
 * Fetches workspace notes with author display names.
 */
export async function getWorkspaceNotes(workspaceId: string): Promise<Note[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching notes:", error);
    return [];
  }

  return (data || []) as Note[];
}

/**
 * Creates a new note (Owner, Coordinator, Contributor).
 */
export async function createNoteAction(
  input: CreateNoteInput
): Promise<ActionResult<Note>> {
  const parsed = createNoteSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid note details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "note", "create");
  if (!allowed) {
    return { success: false, error: "You do not have permission to create notes" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      workspace_id: context.workspace.id,
      title: parsed.data.title,
      body: parsed.data.body,
      category: parsed.data.category || "General",
      related_appointment_id: parsed.data.relatedAppointmentId || null,
      related_task_id: parsed.data.relatedTaskId || null,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !note) {
    return { success: false, error: error?.message || "Failed to create note" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "note",
    targetId: note.id,
    targetTitle: note.title,
  });

  revalidatePath("/notes");
  revalidatePath("/today");
  return { success: true, data: note as Note };
}

/**
 * Updates a note.
 */
export async function updateNoteAction(
  noteId: string,
  input: UpdateNoteInput
): Promise<ActionResult<Note>> {
  const parsed = updateNoteSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid note update" };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: currentNote, error: fetchError } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !currentNote) {
    return { success: false, error: "Note not found" };
  }

  const isCreator = currentNote.author_id === user.id;
  const allowed = checkPermission(context.userRole, "note", "update", { isCreator });

  if (!allowed) {
    return { success: false, error: "You do not have permission to edit this note" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.body !== undefined) updateData.body = input.body;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.relatedAppointmentId !== undefined) updateData.related_appointment_id = input.relatedAppointmentId;
  if (input.relatedTaskId !== undefined) updateData.related_task_id = input.relatedTaskId;

  const { data: updated, error: updateError } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", noteId)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message || "Failed to update note" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "note",
    targetId: noteId,
    targetTitle: updated.title,
  });

  revalidatePath("/notes");
  return { success: true, data: updated as Note };
}

/**
 * Soft deletes a note.
 */
export async function deleteNoteAction(noteId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: currentNote } = await supabase
    .from("notes")
    .select("author_id")
    .eq("id", noteId)
    .eq("workspace_id", context.workspace.id)
    .maybeSingle();

  if (!currentNote) return { success: false, error: "Note not found" };

  const isCreator = currentNote.author_id === user.id;
  const allowed = checkPermission(context.userRole, "note", "delete", { isCreator });

  if (!allowed) {
    return { success: false, error: "You do not have permission to delete this note" };
  }

  const { error } = await supabase
    .from("notes")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("workspace_id", context.workspace.id);

  if (error) return { success: false, error: error.message };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "note",
    targetId: noteId,
    targetTitle: "Note",
  });

  revalidatePath("/notes");
  return { success: true };
}

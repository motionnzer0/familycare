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

  return (data || []).map((row) => {
    let category = "General";
    let title = row.title || "";
    const match = title.match(/^\[(General|Appointment|Family|Care|Other)\]\s*(.*)$/i);
    if (match) {
      category = match[1];
      title = match[2];
    }
    return {
      ...row,
      title: title || row.title,
      category,
    };
  }) as Note[];
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

  const rawCategory = parsed.data.category || "General";
  const rawTitle = parsed.data.title.replace(/^\[[^\]]+\]\s*/, "").trim();
  const dbTitle = rawCategory && rawCategory !== "General" ? `[${rawCategory}] ${rawTitle}` : rawTitle;

  const { data: note, error } = await supabase
    .from("notes")
    .insert({
      workspace_id: context.workspace.id,
      title: dbTitle,
      body: parsed.data.body,
      author_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !note) {
    return { success: false, error: error?.message || "Failed to create note" };
  }

  const mappedNote: Note = {
    ...note,
    title: rawTitle,
    category: rawCategory,
  };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "created",
    targetType: "note",
    targetId: note.id,
    targetTitle: mappedNote.title,
  });

  revalidatePath("/notes");
  revalidatePath("/today");
  return { success: true, data: mappedNote };
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

  if (input.title !== undefined || input.category !== undefined) {
    let currentCategory = "General";
    let currentTitle = currentNote.title || "";
    const match = currentTitle.match(/^\[(General|Appointment|Family|Care|Other)\]\s*(.*)$/i);
    if (match) {
      currentCategory = match[1];
      currentTitle = match[2];
    }
    const newCategory = input.category ?? currentCategory;
    const newTitle = (input.title ?? currentTitle).replace(/^\[[^\]]+\]\s*/, "").trim();
    updateData.title = newCategory && newCategory !== "General" ? `[${newCategory}] ${newTitle}` : newTitle;
  }

  if (input.body !== undefined) updateData.body = input.body;

  const { data: updated, error: updateError } = await supabase
    .from("notes")
    .update(updateData)
    .eq("id", noteId)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message || "Failed to update note" };
  }

  let finalCategory = "General";
  let finalTitle = updated.title || "";
  const match = finalTitle.match(/^\[(General|Appointment|Family|Care|Other)\]\s*(.*)$/i);
  if (match) {
    finalCategory = match[1];
    finalTitle = match[2];
  }

  const mappedNote: Note = {
    ...updated,
    title: finalTitle,
    category: finalCategory,
  };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "note",
    targetId: noteId,
    targetTitle: mappedNote.title,
  });

  revalidatePath("/notes");
  return { success: true, data: mappedNote };
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

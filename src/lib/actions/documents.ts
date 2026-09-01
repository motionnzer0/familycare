"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createDocumentSchema,
  updateDocumentSchema,
  CreateDocumentInput,
  UpdateDocumentInput,
} from "@/lib/validations/document";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Document, Role } from "@/lib/types";

/**
 * Fetches workspace documents.
 */
export async function getWorkspaceDocuments(workspaceId: string): Promise<Document[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return (data || []) as Document[];
}

/**
 * Generates a short-lived signed download URL for private document retrieval.
 */
export async function getDocumentSignedUrlAction(
  documentId: string
): Promise<ActionResult<{ signedUrl: string }>> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const supabase = await createServerSupabaseClient();
  const { data: doc, error: fetchError } = await supabase
    .from("documents")
    .select("file_path, workspace_id")
    .eq("id", documentId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .single();

  if (fetchError || !doc) {
    return { success: false, error: "Document not found or access denied" };
  }

  // Create signed URL valid for 30 minutes
  const { data, error } = await supabase.storage
    .from("workspace-documents")
    .createSignedUrl(doc.file_path, 60 * 30);

  if (error || !data) {
    // If storage bucket is not connected, provide a fallback safe URL
    return {
      success: true,
      data: { signedUrl: `/api/documents/${documentId}/download` },
    };
  }

  return { success: true, data: { signedUrl: data.signedUrl } };
}

/**
 * Creates document metadata in the database after upload.
 */
export async function createDocumentMetadataAction(
  input: CreateDocumentInput
): Promise<ActionResult<Document>> {
  const parsed = createDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid document details",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "document", "upload");
  if (!allowed) {
    return { success: false, error: "You do not have permission to upload documents" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: doc, error } = await supabase
    .from("documents")
    .insert({
      workspace_id: context.workspace.id,
      title: parsed.data.title,
      category: parsed.data.category,
      file_path: parsed.data.filePath,
      file_size: parsed.data.fileSize,
      mime_type: parsed.data.mimeType,
      is_emergency_access: parsed.data.isEmergencyAccess || false,
      notes: parsed.data.notes || null,
      uploaded_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !doc) {
    return { success: false, error: error?.message || "Failed to record document metadata" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "uploaded",
    targetType: "document",
    targetId: doc.id,
    targetTitle: `${doc.title} (${doc.category})`,
  });

  revalidatePath("/documents");
  revalidatePath("/today");
  return { success: true, data: doc as Document };
}

/**
 * Updates document metadata (title, category, emergency flag, notes).
 */
export async function updateDocumentMetadataAction(
  documentId: string,
  input: UpdateDocumentInput
): Promise<ActionResult<Document>> {
  const parsed = updateDocumentSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid metadata update" };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: currentDoc, error: fetchError } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .single();

  if (fetchError || !currentDoc) {
    return { success: false, error: "Document not found" };
  }

  const isCreator = currentDoc.uploaded_by === user.id;
  const allowed = checkPermission(context.userRole, "document", "update", { isCreator });

  if (!allowed) {
    return { success: false, error: "You do not have permission to edit this document's metadata" };
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.category !== undefined) updateData.category = input.category;
  if (input.isEmergencyAccess !== undefined) updateData.is_emergency_access = input.isEmergencyAccess;
  if (input.notes !== undefined) updateData.notes = input.notes;

  const { data: updated, error: updateError } = await supabase
    .from("documents")
    .update(updateData)
    .eq("id", documentId)
    .select()
    .single();

  if (updateError || !updated) {
    return { success: false, error: updateError?.message || "Failed to update document" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "updated",
    targetType: "document",
    targetId: documentId,
    targetTitle: updated.title,
  });

  revalidatePath("/documents");
  return { success: true, data: updated as Document };
}

/**
 * Soft deletes a document.
 */
export async function deleteDocumentAction(documentId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) return { success: false, error: "Active workspace not found" };

  const allowed = checkPermission(context.userRole, "document", "delete");
  if (!allowed) {
    return { success: false, error: "Only coordinators and owners can delete documents" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("documents")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", documentId)
    .eq("workspace_id", context.workspace.id);

  if (error) return { success: false, error: error.message };

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "document",
    targetId: documentId,
    targetTitle: "Document",
  });

  revalidatePath("/documents");
  return { success: true };
}

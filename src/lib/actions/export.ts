"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { checkPermission } from "@/lib/permissions";
import { getActiveWorkspaceContext } from "./workspace";
import { ActionResult } from "./auth";

export interface WorkspaceExportData {
  exportedAt: string;
  version: string;
  workspace: {
    id: string;
    name: string;
    timezone: string;
    createdAt: string;
  };
  careRecipient: {
    preferredName: string;
    birthDate?: string | null;
    phone?: string | null;
    email?: string | null;
    careContext?: string | null;
  } | null;
  tasks: Array<{
    id: string;
    title: string;
    description: string | null;
    status: string;
    dueDate: string | null;
    dueTime: string | null;
    createdAt: string;
  }>;
  appointments: Array<{
    id: string;
    title: string;
    date: string;
    startTime: string | null;
    endTime: string | null;
    location: string | null;
    providerContact: string | null;
    status: string;
    details: string | null;
  }>;
  medications: Array<{
    id: string;
    name: string;
    dosage?: string | null;
    instructions?: string | null;
    frequency?: string | null;
    schedule?: string | null;
    prescribingProvider?: string | null;
    status: string;
    notes?: string | null;
  }>;
  notes: Array<{
    id: string;
    title: string | null;
    body: string;
    category?: string;
    createdAt: string;
  }>;
  emergencyInformation: {
    preferredHospital: string | null;
    allergiesConditions: string | null;
    insuranceInfo: string | null;
    additionalNotes: string | null;
    contacts: Array<{
      name: string;
      phone: string;
      relationship: string | null;
      isPrimary: boolean;
    }>;
  };
  careTeam: Array<{
    displayName: string | null;
    role: string;
    joinedAt: string;
  }>;
  documentsManifest: Array<{
    id: string;
    title: string;
    category: string;
    fileSize: number;
    mimeType: string;
    isEmergencyAccess: boolean;
    createdAt: string;
  }>;
}

/**
 * Generates structured JSON export payload for the active workspace.
 */
export async function exportWorkspaceDataAction(): Promise<ActionResult<WorkspaceExportData>> {
  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const supabase = await createServerSupabaseClient();
  const workspaceId = context.workspace.id;

  // Fetch all non-deleted records in parallel strictly scoped to this workspace
  const [
    tasksRes,
    apptsRes,
    medsRes,
    notesRes,
    emInfoRes,
    emContactsRes,
    membersRes,
    docsRes,
  ] = await Promise.all([
    supabase.from("tasks").select("*").eq("workspace_id", workspaceId).is("deleted_at", null),
    supabase.from("appointments").select("*").eq("workspace_id", workspaceId).is("deleted_at", null),
    supabase.from("medications").select("*").eq("workspace_id", workspaceId).is("deleted_at", null),
    supabase.from("notes").select("*").eq("workspace_id", workspaceId).is("deleted_at", null),
    supabase.from("emergency_info").select("*").eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("emergency_contacts").select("*").eq("workspace_id", workspaceId).order("sort_order"),
    supabase.from("workspace_members").select("*").eq("workspace_id", workspaceId).eq("status", "active"),
    supabase.from("documents").select("*").eq("workspace_id", workspaceId).is("deleted_at", null),
  ]);

  const exportPayload: WorkspaceExportData = {
    exportedAt: new Date().toISOString(),
    version: "1.0",
    workspace: {
      id: context.workspace.id,
      name: context.workspace.name,
      timezone: context.workspace.timezone,
      createdAt: context.workspace.created_at,
    },
    careRecipient: context.careRecipient
      ? {
          preferredName: context.careRecipient.preferred_name,
          birthDate: context.careRecipient.birth_date,
          phone: context.careRecipient.phone,
          email: context.careRecipient.email,
          careContext: context.careRecipient.care_context,
        }
      : null,
    tasks: (tasksRes.data || []).map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status,
      dueDate: t.due_date,
      dueTime: t.due_time,
      createdAt: t.created_at,
    })),
    appointments: (apptsRes.data || []).map((a) => ({
      id: a.id,
      title: a.title,
      date: a.date,
      startTime: a.start_time,
      endTime: a.end_time,
      location: a.location,
      providerContact: a.provider_contact,
      status: a.status,
      details: a.details,
    })),
    medications: (medsRes.data || []).map((m) => ({
      id: m.id,
      name: m.name,
      dosage: m.dosage || m.form_strength,
      instructions: m.instructions,
      frequency: m.frequency,
      schedule: m.schedule,
      prescribingProvider: m.prescribing_provider || m.prescriber_pharmacy,
      status: m.status,
      notes: m.notes || m.note,
    })),
    notes: (notesRes.data || []).map((n) => ({
      id: n.id,
      title: n.title,
      body: n.body,
      category: n.category,
      createdAt: n.created_at,
    })),
    emergencyInformation: {
      preferredHospital: emInfoRes.data?.preferred_hospital || null,
      allergiesConditions: emInfoRes.data?.allergies_conditions || null,
      insuranceInfo: emInfoRes.data?.insurance_info || null,
      additionalNotes: emInfoRes.data?.additional_notes || null,
      contacts: (emContactsRes.data || []).map((c) => ({
        name: c.name,
        phone: c.phone,
        relationship: c.relationship,
        isPrimary: c.is_primary,
      })),
    },
    careTeam: (membersRes.data || []).map((m) => ({
      displayName: m.display_name,
      role: m.role,
      joinedAt: m.joined_at,
    })),
    documentsManifest: (docsRes.data || []).map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      fileSize: d.file_size,
      mimeType: d.mime_type,
      isEmergencyAccess: d.is_emergency_access || false,
      createdAt: d.created_at,
    })),
  };

  return { success: true, data: exportPayload };
}

// Family Care Command Center — Timeline Event Logger
// Reference: /docs/ARCHITECTURE.md and /docs/DATABASE.md (Table 3.13)

import { SupabaseClient } from "@supabase/supabase-js";

export interface LogTimelineEventParams {
  workspaceId: string;
  actorId: string;
  action: string;
  targetType: "task" | "appointment" | "medication" | "document" | "note" | "emergency_info" | "care_recipient" | "workspace_member" | "workspace";
  targetId: string;
  targetTitle?: string | null;
  metadata?: Record<string, unknown> | null;
}

/**
 * Creates an immutable activity event in the timeline_events table.
 * Passive views are never logged (D-22).
 */
export async function logTimelineEvent(
  supabase: SupabaseClient,
  params: LogTimelineEventParams
) {
  try {
    const { error } = await supabase.from("timeline_events").insert({
      workspace_id: params.workspaceId,
      actor_id: params.actorId,
      action: params.action,
      target_type: params.targetType,
      target_id: params.targetId,
      target_title: params.targetTitle || null,
      metadata: params.metadata || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Failed to log timeline event:", error);
    }
  } catch (err) {
    console.error("Exception logging timeline event:", err);
  }
}

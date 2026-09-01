"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TimelineEvent } from "@/lib/types";

/**
 * Fetches workspace activity events for the /updates timeline.
 */
export async function getWorkspaceUpdates(
  workspaceId: string,
  limit: number = 50
): Promise<TimelineEvent[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching updates:", error);
    return [];
  }

  return (data || []) as TimelineEvent[];
}

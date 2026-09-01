"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getWorkspaceCurrentDate } from "@/lib/timezone";
import { Task, Appointment, TimelineEvent, Role } from "@/lib/types";

export interface DashboardData {
  todayDateStr: string;
  overdueTasks: Task[];
  todayTasks: Task[];
  todayAppointments: Appointment[];
  upcomingTasks: Task[];
  upcomingAppointments: Appointment[];
  recentChanges: TimelineEvent[];
  members: { id: string; name: string; role: Role }[];
  careRecipientName: string;
  workspaceName: string;
  userRole: Role;
}

/**
 * Fetches prioritized dashboard data for the Today screen.
 */
export async function getDashboardData(
  workspaceId: string,
  timezone: string = "America/New_York",
  careRecipientName: string = "Mom",
  workspaceName: string = "Family Workspace",
  userRole: Role = "owner"
): Promise<DashboardData> {
  const supabase = await createServerSupabaseClient();
  const todayDateStr = getWorkspaceCurrentDate(timezone);

  // Compute 7-day lookahead date
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const nextWeekStr = getWorkspaceCurrentDate(timezone, nextWeek);

  const [
    overdueRes,
    todayTasksRes,
    todayApptsRes,
    upcomingTasksRes,
    upcomingApptsRes,
    timelineRes,
    membersRes,
  ] = await Promise.all([
    // 1. Overdue tasks: open tasks due before today
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "open")
      .lt("due_date", todayDateStr)
      .is("deleted_at", null)
      .order("due_date", { ascending: true })
      .limit(20),

    // 2. Today tasks: open tasks due today
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "open")
      .eq("due_date", todayDateStr)
      .is("deleted_at", null)
      .order("due_time", { ascending: true, nullsFirst: false }),

    // 3. Today appointments: scheduled/completed today
    supabase
      .from("appointments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("date", todayDateStr)
      .neq("status", "cancelled")
      .is("deleted_at", null)
      .order("start_time", { ascending: true, nullsFirst: false }),

    // 4. Upcoming tasks (next 7 days)
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .eq("status", "open")
      .gt("due_date", todayDateStr)
      .lte("due_date", nextWeekStr)
      .is("deleted_at", null)
      .order("due_date", { ascending: true }),

    // 5. Upcoming appointments (next 7 days)
    supabase
      .from("appointments")
      .select("*")
      .eq("workspace_id", workspaceId)
      .gt("date", todayDateStr)
      .lte("date", nextWeekStr)
      .neq("status", "cancelled")
      .is("deleted_at", null)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: false }),

    // 6. Recent changes: last 5 timeline events
    supabase
      .from("timeline_events")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. Active members
    supabase
      .from("workspace_members")
      .select("user_id, display_name, role")
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),
  ]);

  const members = (membersRes.data || []).map((m) => ({
    id: m.user_id,
    name: m.display_name || "Caregiver",
    role: m.role as Role,
  }));

  return {
    todayDateStr,
    overdueTasks: (overdueRes.data || []) as Task[],
    todayTasks: (todayTasksRes.data || []) as Task[],
    todayAppointments: (todayApptsRes.data || []) as Appointment[],
    upcomingTasks: (upcomingTasksRes.data || []) as Task[],
    upcomingAppointments: (upcomingApptsRes.data || []) as Appointment[],
    recentChanges: (timelineRes.data || []) as TimelineEvent[],
    members,
    careRecipientName,
    workspaceName,
    userRole,
  };
}

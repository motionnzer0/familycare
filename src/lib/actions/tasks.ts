"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { createTaskSchema, CreateTaskInput } from "@/lib/validations/task";
import { checkPermission } from "@/lib/permissions";
import { logTimelineEvent } from "@/lib/timeline";
import { ActionResult } from "./auth";
import { getActiveWorkspaceContext } from "./workspace";
import { Task, Role } from "@/lib/types";

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
  dueTime?: string | null;
  relatedAppointmentId?: string | null;
  relatedDocumentId?: string | null;
}

/**
 * Creates a new task in the active workspace.
 */
export async function createTaskAction(
  input: CreateTaskInput
): Promise<ActionResult<Task>> {
  const parsed = createTaskSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Invalid task input",
    };
  }

  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const workspaceId = context.workspace.id;

  // Authorization check
  const allowed = checkPermission(context.userRole, "task", "create");
  if (!allowed) {
    return { success: false, error: "You do not have permission to create tasks" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "User session not found" };
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      title: parsed.data.title,
      description: parsed.data.description || null,
      assignee_id: parsed.data.assigneeId || null,
      due_date: parsed.data.dueDate || null,
      due_time: parsed.data.dueTime || null,
      related_appointment_id: parsed.data.relatedAppointmentId || null,
      related_document_id: parsed.data.relatedDocumentId || null,
      status: "open",
      created_by: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !task) {
    return { success: false, error: error?.message || "Failed to create task" };
  }

  // Log timeline event
  await logTimelineEvent(supabase, {
    workspaceId,
    actorId: user.id,
    action: "created",
    targetType: "task",
    targetId: task.id,
    targetTitle: task.title,
  });

  revalidatePath("/today");
  revalidatePath("/tasks");
  return { success: true, data: task as Task };
}

/**
 * Updates an existing task.
 */
export async function updateTaskAction(
  taskId: string,
  input: UpdateTaskInput
): Promise<ActionResult<Task>> {
  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  // Fetch current task to check ownership / assignment
  const { data: currentTask, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !currentTask) {
    return { success: false, error: "Task not found" };
  }

  const isCreator = currentTask.created_by === user.id;
  const allowed = checkPermission(context.userRole, "task", "update", { isCreator });

  if (!allowed) {
    return { success: false, error: "You do not have permission to edit this task" };
  }

  // If changing assignee, verify coordinator/owner role
  if (input.assigneeId !== undefined && input.assigneeId !== currentTask.assignee_id) {
    const canAssign = checkPermission(context.userRole, "task", "assign");
    if (!canAssign) {
      return { success: false, error: "Only coordinators and owners can assign tasks to others" };
    }
  }

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) updateData.title = input.title;
  if (input.description !== undefined) updateData.description = input.description;
  if (input.assigneeId !== undefined) updateData.assignee_id = input.assigneeId;
  if (input.dueDate !== undefined) updateData.due_date = input.dueDate;
  if (input.dueTime !== undefined) updateData.due_time = input.dueTime;
  if (input.relatedAppointmentId !== undefined) updateData.related_appointment_id = input.relatedAppointmentId;

  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (updateError || !updatedTask) {
    return { success: false, error: updateError?.message || "Failed to update task" };
  }

  // Log timeline event
  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: input.assigneeId !== currentTask.assignee_id ? "assigned" : "updated",
    targetType: "task",
    targetId: taskId,
    targetTitle: updatedTask.title,
    metadata: { previousAssignee: currentTask.assignee_id, newAssignee: updatedTask.assignee_id },
  });

  revalidatePath("/today");
  revalidatePath("/tasks");
  return { success: true, data: updatedTask as Task };
}

/**
 * Toggles a task between open and completed.
 */
export async function toggleTaskCompleteAction(
  taskId: string,
  completed: boolean
): Promise<ActionResult<Task>> {
  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { data: currentTask, error: fetchError } = await supabase
    .from("tasks")
    .select("*")
    .eq("id", taskId)
    .eq("workspace_id", context.workspace.id)
    .is("deleted_at", null)
    .maybeSingle();

  if (fetchError || !currentTask) {
    return { success: false, error: "Task not found" };
  }

  const isAssignee = currentTask.assignee_id === user.id;
  const isUnassigned = currentTask.assignee_id === null;

  const allowed = checkPermission(context.userRole, "task", "complete", {
    isAssignee,
    isUnassigned,
  });

  if (!allowed) {
    return { success: false, error: "You do not have permission to change this task status" };
  }

  const status = completed ? "completed" : "open";
  const { data: updatedTask, error: updateError } = await supabase
    .from("tasks")
    .update({
      status,
      completed_by: completed ? user.id : null,
      completed_at: completed ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("workspace_id", context.workspace.id)
    .select()
    .single();

  if (updateError || !updatedTask) {
    return { success: false, error: updateError?.message || "Failed to update task" };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: completed ? "completed" : "reopened",
    targetType: "task",
    targetId: taskId,
    targetTitle: updatedTask.title,
  });

  revalidatePath("/today");
  revalidatePath("/tasks");
  return { success: true, data: updatedTask as Task };
}

/**
 * Soft deletes a task (sets deleted_at = now()).
 */
export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const context = await getActiveWorkspaceContext();
  if (!context) {
    return { success: false, error: "Active workspace not found" };
  }

  const allowed = checkPermission(context.userRole, "task", "delete");
  if (!allowed) {
    return { success: false, error: "Only owners and coordinators can delete tasks" };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Authentication required" };

  const { error } = await supabase
    .from("tasks")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", taskId)
    .eq("workspace_id", context.workspace.id);

  if (error) {
    return { success: false, error: error.message };
  }

  await logTimelineEvent(supabase, {
    workspaceId: context.workspace.id,
    actorId: user.id,
    action: "deleted",
    targetType: "task",
    targetId: taskId,
  });

  revalidatePath("/today");
  revalidatePath("/tasks");
  return { success: true };
}

/**
 * Fetches workspace tasks for the /tasks view.
 */
export async function getWorkspaceTasks(
  workspaceId: string
): Promise<{ tasks: Task[]; members: { id: string; name: string; role: Role }[] }> {
  const supabase = await createServerSupabaseClient();

  const [tasksRes, membersRes] = await Promise.all([
    supabase
      .from("tasks")
      .select("*")
      .eq("workspace_id", workspaceId)
      .is("deleted_at", null)
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("workspace_members")
      .select("user_id, display_name, role")
      .eq("workspace_id", workspaceId)
      .eq("status", "active"),
  ]);

  const tasks = (tasksRes.data || []) as Task[];
  const members = (membersRes.data || []).map((m) => ({
    id: m.user_id,
    name: m.display_name || "Caregiver",
    role: m.role as Role,
  }));

  return { tasks, members };
}

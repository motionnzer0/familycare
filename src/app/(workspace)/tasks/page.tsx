import React from "react";
import { getActiveWorkspaceContext } from "@/lib/actions/workspace";
import { getWorkspaceTasks } from "@/lib/actions/tasks";
import { TaskList } from "@/components/tasks/TaskList";

export default async function TasksPage() {
  const context = await getActiveWorkspaceContext();

  if (!context) {
    return null;
  }

  const { tasks, members } = await getWorkspaceTasks(context.workspace.id);

  return (
    <TaskList
      initialTasks={tasks}
      members={members}
      userRole={context.userRole}
      timezone={context.workspace.timezone}
    />
  );
}

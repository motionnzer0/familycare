"use client";

import React, { useTransition } from "react";
import { Check, Clock, User, Calendar, Trash2 } from "lucide-react";
import { Task, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleTaskCompleteAction, deleteTaskAction } from "@/lib/actions/tasks";
import { isTaskOverdue, isTaskDueToday, formatInWorkspaceTz } from "@/lib/timezone";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  members: { id: string; name: string; role: Role }[];
  userRole: Role;
  timezone?: string;
  onEdit?: (task: Task) => void;
}

export function TaskItem({
  task,
  members,
  userRole,
  timezone = "America/New_York",
  onEdit,
}: TaskItemProps) {
  const [isPending, startTransition] = useTransition();

  const isCompleted = task.status === "completed";
  const overdue = isTaskOverdue(task.due_date, task.status, timezone);
  const dueToday = isTaskDueToday(task.due_date, timezone);

  const assignee = members.find((m) => m.id === task.assignee_id);
  const assigneeName = assignee ? assignee.name : "Unassigned";

  const handleToggle = () => {
    startTransition(async () => {
      await toggleTaskCompleteAction(task.id, !isCompleted);
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this task?")) {
      startTransition(async () => {
        await deleteTaskAction(task.id);
      });
    }
  };

  return (
    <div
      className={cn(
        "group flex items-start space-x-3 rounded-lg border border-border bg-surface p-3.5 sm:p-4 transition-all hover:border-slate-300 hover:shadow-sm",
        isCompleted && "bg-surface-subtle opacity-75",
        overdue && !isCompleted && "border-amber-300 bg-amber-50/40"
      )}
    >
      {/* Accessible Checkbox with 44px minimum tap target area */}
      <button
        type="button"
        role="checkbox"
        aria-checked={isCompleted}
        aria-label={`Mark ${task.title} as ${isCompleted ? "incomplete" : "complete"}`}
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          "flex h-6 w-6 mt-0.5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
          isCompleted
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-slate-400 bg-surface hover:border-brand"
        )}
      >
        {isCompleted && <Check className="h-4 w-4 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div
        className="flex-1 min-w-0 cursor-pointer"
        onClick={() => onEdit && onEdit(task)}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "text-base font-semibold text-content leading-snug break-words",
              isCompleted && "line-through text-content-subtle"
            )}
          >
            {task.title}
          </span>

          {/* Overdue / Due Today status pills */}
          {overdue && !isCompleted && (
            <Badge variant="overdue" className="text-xs">
              Overdue
            </Badge>
          )}
          {dueToday && !isCompleted && (
            <Badge variant="dueToday" className="text-xs">
              Due Today
            </Badge>
          )}
        </div>

        {task.description && (
          <p className="text-sm text-content-muted mt-1 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Metadata Footer: Assignee + Due Date */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-content-muted mt-2.5">
          {/* Assignee Badge */}
          <span className="inline-flex items-center space-x-1">
            <User className="h-3.5 w-3.5 text-content-subtle" />
            <span
              className={cn(
                "font-medium",
                task.assignee_id ? "text-content" : "text-amber-800 font-semibold"
              )}
            >
              {assigneeName}
            </span>
          </span>

          {/* Due Date & Time */}
          {task.due_date && (
            <span className="inline-flex items-center space-x-1">
              <Calendar className="h-3.5 w-3.5 text-content-subtle" />
              <span className={cn(overdue && !isCompleted && "text-amber-900 font-bold")}>
                {formatInWorkspaceTz(task.due_date, timezone, "MMM d")}
              </span>
            </span>
          )}

          {task.due_time && (
            <span className="inline-flex items-center space-x-1">
              <Clock className="h-3.5 w-3.5 text-content-subtle" />
              <span>{task.due_time.substring(0, 5)}</span>
            </span>
          )}
        </div>
      </div>

      {/* Action Controls for Owner / Coordinator */}
      {(userRole === "owner" || userRole === "coordinator") && (
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label="Delete task"
            className="h-8 w-8 text-content-subtle hover:text-danger"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

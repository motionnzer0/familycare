"use client";

import React, { useState, useTransition } from "react";
import { Check, Clock, User, Calendar, Trash2, AlertCircle } from "lucide-react";
import { Task, Role } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCompleted = task.status === "completed";
  const overdue = isTaskOverdue(task.due_date, task.status, timezone);
  const dueToday = isTaskDueToday(task.due_date, timezone);

  const assignee = members.find((m) => m.id === task.assignee_id);
  const assigneeName = assignee ? assignee.name : "Unassigned";

  const handleToggle = () => {
    setError(null);
    startTransition(async () => {
      const res = await toggleTaskCompleteAction(task.id, !isCompleted);
      if (!res.success) {
        setError(res.error || "Failed to update task status");
      }
    });
  };

  const handleDeleteConfirm = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteTaskAction(task.id);
      if (!res.success) {
        setError(res.error || "Failed to delete task");
      } else {
        setConfirmOpen(false);
      }
    });
  };

  return (
    <>
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
            "flex h-6 w-6 mt-0.5 shrink-0 items-center justify-center rounded border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-[44px] min-w-[44px] sm:min-h-[24px] sm:min-w-[24px]",
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

          {error && (
            <div className="flex items-center justify-between text-xs text-red-700 bg-red-50 border border-red-200 rounded px-2.5 py-1.5 mt-2">
              <div className="flex items-center space-x-1.5">
                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setError(null);
                }}
                className="ml-2 font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
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
          <div className="flex items-center space-x-1 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              disabled={isPending}
              onClick={(e) => {
                e.stopPropagation();
                setConfirmOpen(true);
              }}
              aria-label={`Delete task: ${task.title}`}
              className="min-h-[44px] min-w-[44px] sm:min-h-[32px] sm:min-w-[32px] sm:h-8 sm:w-8 text-content-subtle hover:text-danger focus-visible:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Task"
        description={`Are you sure you want to delete "${task.title}"? This action will remove the task from your workspace.`}
        confirmLabel="Delete Task"
        variant="danger"
        isPending={isPending}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}

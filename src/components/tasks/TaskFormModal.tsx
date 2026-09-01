"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { createTaskAction, updateTaskAction } from "@/lib/actions/tasks";
import { Task, Role } from "@/lib/types";

interface TaskFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  members: { id: string; name: string; role: Role }[];
  userRole: Role;
}

export function TaskFormModal({
  open,
  onOpenChange,
  task,
  members,
  userRole,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!task;

  useEffect(() => {
    if (task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setAssigneeId(task.assignee_id || "");
      setDueDate(task.due_date || "");
      setDueTime(task.due_time ? task.due_time.substring(0, 5) : "");
    } else {
      setTitle("");
      setDescription("");
      setAssigneeId("");
      setDueDate("");
      setDueTime("");
    }
    setError(null);
  }, [task, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please enter a task title.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      if (isEditing && task) {
        const res = await updateTaskAction(task.id, {
          title: title.trim(),
          description: description.trim() || null,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
        });

        if (!res.success) {
          setError(res.error || "Failed to update task");
          setLoading(false);
          return;
        }
      } else {
        const res = await createTaskAction({
          title: title.trim(),
          description: description.trim() || null,
          assigneeId: assigneeId || null,
          dueDate: dueDate || null,
          dueTime: dueTime || null,
        });

        if (!res.success) {
          setError(res.error || "Failed to create task");
          setLoading(false);
          return;
        }
      }

      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const canAssign = userRole === "owner" || userRole === "coordinator";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Task" : "Add New Task"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {error && (
            <Alert variant="danger">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="task-title">
              Task title <span className="text-danger">*</span>
            </Label>
            <Input
              id="task-title"
              placeholder="e.g. Pick up heart medication from pharmacy"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="task-description">Description (optional)</Label>
            <textarea
              id="task-description"
              rows={3}
              placeholder="Add details, instructions, or notes for the team..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex w-full rounded border border-border bg-surface px-3 py-2 text-base text-content placeholder:text-content-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
            />
          </div>

          {canAssign && (
            <div className="space-y-1.5">
              <Label htmlFor="task-assignee">Assign to</Label>
              <select
                id="task-assignee"
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="flex h-11 w-full rounded border border-border bg-surface px-3 py-2 text-base text-content focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-1"
              >
                <option value="">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="task-due-date">Due date</Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="task-due-time">Due time</Label>
              <Input
                id="task-due-time"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : isEditing
                ? "Save Changes"
                : "Add Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

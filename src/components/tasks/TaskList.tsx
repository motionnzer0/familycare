"use client";

import React, { useState } from "react";
import { Plus, CheckSquare, ListFilter } from "lucide-react";
import { Task, Role } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { TaskFormModal } from "./TaskFormModal";
import { Button } from "@/components/ui/button";
import { isTaskOverdue, isTaskDueToday } from "@/lib/timezone";

interface TaskListProps {
  initialTasks: Task[];
  members: { id: string; name: string; role: Role }[];
  userRole: Role;
  timezone?: string;
}

export function TaskList({
  initialTasks,
  members,
  userRole,
  timezone = "America/New_York",
}: TaskListProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "open" | "completed">("open");

  const openTasks = initialTasks.filter((t) => t.status === "open");
  const completedTasks = initialTasks.filter((t) => t.status === "completed");

  const overdueTasks = openTasks.filter((t) => isTaskOverdue(t.due_date, t.status, timezone));
  const dueTodayTasks = openTasks.filter((t) => isTaskDueToday(t.due_date, timezone));
  const otherOpenTasks = openTasks.filter(
    (t) => !isTaskOverdue(t.due_date, t.status, timezone) && !isTaskDueToday(t.due_date, timezone)
  );

  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedTask(null);
    setModalOpen(true);
  };

  const canCreate = userRole !== "viewer";

  return (
    <div className="space-y-6 max-w-reading">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
            Tasks
          </h1>
          <p className="text-base text-content-muted mt-0.5">
            Coordination responsibilities across your care team.
          </p>
        </div>

        {canCreate && (
          <Button
            variant="primary"
            onClick={handleCreate}
            className="flex items-center space-x-2 shrink-0 self-start sm:self-auto"
          >
            <Plus className="h-5 w-5" />
            <span>Add Task</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-border pb-2 text-sm font-medium">
        <button
          onClick={() => setActiveFilter("open")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === "open"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          Open ({openTasks.length})
        </button>
        <button
          onClick={() => setActiveFilter("completed")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === "completed"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          Completed ({completedTasks.length})
        </button>
        <button
          onClick={() => setActiveFilter("all")}
          className={`px-3 py-1.5 rounded transition-colors ${
            activeFilter === "all"
              ? "bg-slate-900 text-white font-semibold"
              : "text-content-muted hover:text-content"
          }`}
        >
          All ({initialTasks.length})
        </button>
      </div>

      {/* Task Content Sections */}
      {activeFilter !== "completed" && (
        <div className="space-y-6">
          {/* Overdue Section */}
          {overdueTasks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900 flex items-center space-x-1.5">
                <span>Overdue ({overdueTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {overdueTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    members={members}
                    userRole={userRole}
                    timezone={timezone}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Due Today Section */}
          {dueTodayTasks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center space-x-1.5">
                <span>Due Today ({dueTodayTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {dueTodayTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    members={members}
                    userRole={userRole}
                    timezone={timezone}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming & Other Tasks Section */}
          {otherOpenTasks.length > 0 && (
            <div className="space-y-2.5">
              <h2 className="text-sm font-bold uppercase tracking-wider text-content-muted">
                <span>Upcoming &amp; General ({otherOpenTasks.length})</span>
              </h2>
              <div className="space-y-2">
                {otherOpenTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    members={members}
                    userRole={userRole}
                    timezone={timezone}
                    onEdit={handleEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {openTasks.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center space-y-3 bg-surface-subtle">
              <div className="flex h-10 w-10 mx-auto items-center justify-center rounded-full bg-slate-200 text-content-muted">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-content">No open tasks</p>
                <p className="text-sm text-content-muted">
                  Your family care team is all caught up!
                </p>
              </div>
              {canCreate && (
                <Button variant="secondary" size="sm" onClick={handleCreate}>
                  Create your next task
                </Button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Completed Filter View */}
      {activeFilter === "completed" && (
        <div className="space-y-2">
          {completedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              members={members}
              userRole={userRole}
              timezone={timezone}
              onEdit={handleEdit}
            />
          ))}
          {completedTasks.length === 0 && (
            <p className="text-sm text-content-muted text-center py-8">
              No completed tasks yet.
            </p>
          )}
        </div>
      )}

      {/* Modal */}
      <TaskFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        task={selectedTask}
        members={members}
        userRole={userRole}
      />
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  AlertTriangle,
  CalendarDays,
  Clock,
  CheckSquare,
  ArrowRight,
  Activity,
} from "lucide-react";
import { DashboardData } from "@/lib/actions/dashboard";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { AppointmentItem } from "@/components/calendar/AppointmentItem";
import { AppointmentFormModal } from "@/components/calendar/AppointmentFormModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Task, Appointment } from "@/lib/types";
import { formatInWorkspaceTz } from "@/lib/timezone";

interface TodayDashboardProps {
  data: DashboardData;
  timezone?: string;
}

export function TodayDashboard({
  data,
  timezone = "America/New_York",
}: TodayDashboardProps) {
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [apptModalOpen, setApptModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedAppt, setSelectedAppt] = useState<Appointment | null>(null);

  const {
    overdueTasks,
    todayTasks,
    todayAppointments,
    upcomingTasks,
    upcomingAppointments,
    recentChanges,
    members,
    careRecipientName,
    userRole,
  } = data;

  const totalNeedsAttention = overdueTasks.length;
  const totalTodayItems = todayTasks.length + todayAppointments.length;
  const totalUpcomingItems = upcomingTasks.length + upcomingAppointments.length;

  const handleCreateTask = () => {
    setSelectedTask(null);
    setTaskModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setTaskModalOpen(true);
  };

  const handleCreateAppt = () => {
    setSelectedAppt(null);
    setApptModalOpen(true);
  };

  const handleEditAppt = (appt: Appointment) => {
    setSelectedAppt(appt);
    setApptModalOpen(true);
  };

  const canCreate = userRole !== "viewer";
  const canManageAppts = userRole === "owner" || userRole === "coordinator";

  return (
    <div className="space-y-8 max-w-reading">
      {/* 1. Dashboard Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
              Today
            </h1>
            <span className="text-sm font-semibold text-content-subtle">
              ({formatInWorkspaceTz(new Date(), timezone, "EEEE, MMMM d")})
            </span>
          </div>
          <p className="text-base text-content-muted">
            Priorities and coordination schedule for {careRecipientName}.
          </p>
        </div>

        {canCreate && (
          <div className="flex items-center space-x-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={handleCreateTask}
              className="flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task</span>
            </Button>
            {canManageAppts && (
              <Button
                variant="secondary"
                size="sm"
                onClick={handleCreateAppt}
                className="flex items-center space-x-1.5"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Appointment</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* PRIORITY 1: NEEDS ATTENTION (Overdue Work) */}
      {totalNeedsAttention > 0 && (
        <section className="space-y-3 rounded-xl border border-amber-300 bg-amber-50/50 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-800" />
              <h2 className="text-lg font-bold text-amber-950">
                Needs Attention
              </h2>
            </div>
            <Badge variant="overdue" className="font-bold">
              {totalNeedsAttention} Overdue
            </Badge>
          </div>
          <div className="space-y-2 pt-1">
            {overdueTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                members={members}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        </section>
      )}

      {/* PRIORITY 2: TODAY'S PRIORITIES (Tasks & Appointments) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content flex items-center space-x-2">
            <span>Today&apos;s Schedule &amp; Tasks</span>
          </h2>
          <Badge variant="dueToday">{totalTodayItems} scheduled</Badge>
        </div>

        {totalTodayItems > 0 ? (
          <div className="space-y-2.5">
            {/* Appointments first */}
            {todayAppointments.map((appt) => (
              <AppointmentItem
                key={appt.id}
                appointment={appt}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditAppt}
              />
            ))}

            {/* Tasks */}
            {todayTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                members={members}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-surface p-6 text-center space-y-2">
            <p className="text-base font-semibold text-content">
              Nothing scheduled for today
            </p>
            <p className="text-sm text-content-muted">
              No tasks or appointments require attention today.
            </p>
          </div>
        )}
      </section>

      {/* PRIORITY 3: COMING UP (Next 7 Days) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content">
            Coming Up (Next 7 Days)
          </h2>
          <Link
            href="/calendar"
            className="text-xs font-semibold text-brand hover:underline flex items-center space-x-1"
          >
            <span>View Calendar</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {totalUpcomingItems > 0 ? (
          <div className="space-y-2">
            {upcomingAppointments.map((appt) => (
              <AppointmentItem
                key={appt.id}
                appointment={appt}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditAppt}
              />
            ))}
            {upcomingTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                members={members}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditTask}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-content-muted py-2">
            No upcoming items in the next 7 days.
          </p>
        )}
      </section>

      {/* PRIORITY 4: RECENT ACTIVITY */}
      {recentChanges.length > 0 && (
        <section className="space-y-3 border-t border-border pt-6">
          <div className="flex items-center space-x-2 text-content-muted">
            <Activity className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Recent Changes
            </h2>
          </div>

          <div className="space-y-2">
            {recentChanges.map((event) => (
              <div
                key={event.id}
                className="flex items-center justify-between text-xs text-content-muted bg-surface rounded p-2.5 border border-border"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-content capitalize">
                    {event.action}
                  </span>
                  <span>{event.target_type}:</span>
                  <span className="font-medium text-content truncate max-w-[200px]">
                    {event.target_title || event.target_id}
                  </span>
                </div>
                <span className="text-content-subtle shrink-0">
                  {formatInWorkspaceTz(event.created_at, timezone, "MMM d, h:mm a")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Modals */}
      <TaskFormModal
        open={taskModalOpen}
        onOpenChange={setTaskModalOpen}
        task={selectedTask}
        members={members}
        userRole={userRole}
      />

      <AppointmentFormModal
        open={apptModalOpen}
        onOpenChange={setApptModalOpen}
        appointment={selectedAppt}
        tasks={[...todayTasks, ...upcomingTasks, ...overdueTasks]}
      />
    </div>
  );
}

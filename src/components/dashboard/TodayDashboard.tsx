"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronDown,
  AlertTriangle,
  CalendarDays,
  CheckSquare,
  ArrowRight,
  Activity,
  Shield,
  Pill,
  FileText,
  Users,
  StickyNote,
  UserPlus,
} from "lucide-react";
import { DashboardData } from "@/lib/actions/dashboard";
import { TaskItem } from "@/components/tasks/TaskItem";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { AppointmentItem } from "@/components/calendar/AppointmentItem";
import { AppointmentFormModal } from "@/components/calendar/AppointmentFormModal";
import { NoteFormModal } from "@/components/notes/NoteFormModal";
import { DocumentUploadModal } from "@/components/documents/DocumentUploadModal";
import { InviteMemberModal } from "@/components/team/InviteMemberModal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Task, Appointment, TimelineEvent } from "@/lib/types";
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
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [docModalOpen, setDocModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);

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

  const canAddAny = userRole !== "viewer";
  const canManageAppointments = userRole === "owner" || userRole === "coordinator";
  const canInviteMembers = userRole === "owner" || userRole === "coordinator";

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

  // Helper to route timeline events to specific modules
  const getTimelineTargetHref = (event: TimelineEvent): string => {
    switch (event.target_type) {
      case "task":
        return "/tasks";
      case "appointment":
        return "/calendar";
      case "medication":
        return "/medications";
      case "document":
        return "/documents";
      case "note":
        return "/notes";
      case "emergency":
        return "/emergency";
      case "care_recipient":
        return "/settings";
      default:
        return "/updates";
    }
  };

  return (
    <div className="space-y-8 max-w-reading pb-12 md:pb-6">
      {/* 1. Header & Page Identity */}
      <div className="flex items-start justify-between gap-3 border-b border-border pb-6">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-content sm:text-3xl">
              Today for {careRecipientName}
            </h1>
            <span className="text-sm font-semibold text-content-subtle">
              ({formatInWorkspaceTz(new Date(), timezone, "EEEE, MMMM d, yyyy")})
            </span>
          </div>
          <p className="text-sm sm:text-base text-content-muted">
            Priorities and coordination schedule for {careRecipientName}.
          </p>
        </div>

        {/* Unified "+ Add" Action Menu */}
        {canAddAny && (
          <div className="shrink-0 pt-0.5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="primary"
                  size="sm"
                  aria-label="Add item to workspace"
                  className="flex items-center space-x-1.5 min-h-touch px-3.5 sm:px-4 bg-brand text-white hover:bg-teal-800 shadow font-bold text-sm border border-teal-800/40"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Add</span>
                  <ChevronDown className="h-3.5 w-3.5 opacity-90 ml-0.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-surface border border-border shadow-lg rounded-lg p-1.5 z-50">
                <DropdownMenuItem
                  onClick={handleCreateTask}
                  className="flex items-center space-x-2.5 py-2 px-3 rounded-md hover:bg-surface-subtle cursor-pointer text-sm font-medium"
                >
                  <CheckSquare className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium">Task</span>
                </DropdownMenuItem>

                {canManageAppointments && (
                  <DropdownMenuItem
                    onClick={handleCreateAppt}
                    className="flex items-center space-x-2.5 py-2 px-3 rounded-md hover:bg-surface-subtle cursor-pointer text-sm font-medium"
                  >
                    <CalendarDays className="h-4 w-4 text-brand shrink-0" />
                    <span className="font-medium">Appointment</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem
                  onClick={() => setNoteModalOpen(true)}
                  className="flex items-center space-x-2.5 py-2 px-3 rounded-md hover:bg-surface-subtle cursor-pointer text-sm font-medium"
                >
                  <StickyNote className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium">Note</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => setDocModalOpen(true)}
                  className="flex items-center space-x-2.5 py-2 px-3 rounded-md hover:bg-surface-subtle cursor-pointer text-sm font-medium"
                >
                  <FileText className="h-4 w-4 text-brand shrink-0" />
                  <span className="font-medium">Document</span>
                </DropdownMenuItem>

                {canInviteMembers && (
                  <>
                    <DropdownMenuSeparator className="-mx-1 my-1 h-px bg-border" />
                    <DropdownMenuItem
                      onClick={() => setInviteModalOpen(true)}
                      className="flex items-center space-x-2.5 py-2 px-3 rounded-md hover:bg-surface-subtle cursor-pointer text-sm font-medium"
                    >
                      <UserPlus className="h-4 w-4 text-brand shrink-0" />
                      <span className="font-medium">Invite Caregiver</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* PRIORITY 1: NEEDS ATTENTION (Overdue Work) */}
      {totalNeedsAttention > 0 && (
        <section
          aria-label="Needs Attention"
          className="space-y-3 rounded-xl border border-amber-300 bg-amber-50/50 p-4 sm:p-5"
        >
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

      {/* PRIORITY 2: TODAY'S WORKLOAD (Schedule & Tasks) */}
      <section aria-label="Today's Schedule and Tasks" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-content flex items-center space-x-2">
            <span>Today&apos;s Schedule &amp; Tasks</span>
          </h2>
          <Badge variant="dueToday">{totalTodayItems} scheduled</Badge>
        </div>

        {totalTodayItems > 0 ? (
          <div className="space-y-2.5">
            {/* Appointments lead */}
            {todayAppointments.map((appt) => (
              <AppointmentItem
                key={appt.id}
                appointment={appt}
                userRole={userRole}
                timezone={timezone}
                onEdit={handleEditAppt}
              />
            ))}

            {/* Tasks follow */}
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
          <div className="rounded-lg border border-border bg-surface p-6 text-center space-y-3">
            <div className="space-y-1">
              <p className="text-base font-semibold text-content">
                You&apos;re all caught up
              </p>
              <p className="text-sm text-content-muted">
                Nothing requires your attention today.
              </p>
            </div>
            {canAddAny && (
              <div className="pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateTask}
                  className="inline-flex items-center space-x-1.5 text-xs text-brand font-semibold hover:bg-surface-subtle"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Task</span>
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* PRIORITY 3: COMING UP (Next 7 Days) */}
      <section aria-label="Coming Up Next 7 Days" className="space-y-3">
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
            No upcoming items scheduled for the next 7 days.
          </p>
        )}
      </section>

      {/* PRIORITY 4: RECENT CHANGES */}
      {recentChanges.length > 0 && (
        <section
          aria-label="Recent Changes"
          className="space-y-3 border-t border-border pt-6"
        >
          <div className="flex items-center space-x-2 text-content-muted">
            <Activity className="h-4 w-4 text-brand" />
            <h2 className="text-sm font-bold uppercase tracking-wider">
              Recent Changes
            </h2>
          </div>

          <div className="space-y-2">
            {recentChanges.map((event) => {
              const targetHref = getTimelineTargetHref(event);

              return (
                <Link
                  key={event.id}
                  href={targetHref}
                  className="flex items-center justify-between text-xs text-content-muted bg-surface rounded-lg p-3 border border-border hover:border-slate-300 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <div className="flex items-center space-x-2 min-w-0 pr-2">
                    <span className="font-semibold text-content capitalize shrink-0">
                      {event.action}
                    </span>
                    <span className="shrink-0">{event.target_type}:</span>
                    <span className="font-medium text-content truncate max-w-[220px] sm:max-w-[340px]">
                      {event.target_title || event.target_id}
                    </span>
                  </div>
                  <span className="text-content-subtle shrink-0">
                    {formatInWorkspaceTz(event.created_at, timezone, "MMM d, h:mm a")}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* PRIORITY 5: QUICK REFERENCE */}
      <section
        aria-label="Quick Reference"
        className="space-y-3 border-t border-border pt-6"
      >
        <h2 className="text-xs font-bold uppercase tracking-wider text-content-muted">
          Quick Reference
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Emergency */}
          <Link
            href="/emergency"
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 hover:border-red-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-touch"
          >
            <Shield className="h-5 w-5 text-red-700 mb-1.5" />
            <span className="text-sm font-bold text-red-900">Emergency</span>
          </Link>

          {/* Medications */}
          <Link
            href="/medications"
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-lg border border-border bg-surface hover:border-brand/50 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-touch"
          >
            <Pill className="h-5 w-5 text-brand mb-1.5" />
            <span className="text-sm font-semibold text-content">Medications</span>
          </Link>

          {/* Documents */}
          <Link
            href="/documents"
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-lg border border-border bg-surface hover:border-brand/50 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-touch"
          >
            <FileText className="h-5 w-5 text-brand mb-1.5" />
            <span className="text-sm font-semibold text-content">Documents</span>
          </Link>

          {/* Care Team */}
          <Link
            href="/team"
            className="flex flex-col items-center justify-center text-center p-3.5 rounded-lg border border-border bg-surface hover:border-brand/50 hover:bg-surface-subtle transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus min-h-touch"
          >
            <Users className="h-5 w-5 text-brand mb-1.5" />
            <span className="text-sm font-semibold text-content">Care Team</span>
          </Link>
        </div>
      </section>

      {/* Form Modals */}
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

      <NoteFormModal
        open={noteModalOpen}
        onOpenChange={setNoteModalOpen}
      />

      <DocumentUploadModal
        open={docModalOpen}
        onOpenChange={setDocModalOpen}
      />

      <InviteMemberModal
        open={inviteModalOpen}
        onOpenChange={setInviteModalOpen}
      />
    </div>
  );
}

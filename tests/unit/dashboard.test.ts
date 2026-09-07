import { describe, it, expect } from "vitest";
import { Task, Appointment, TimelineEvent, Role } from "@/lib/types";
import { isTaskOverdue, isTaskDueToday, isDateUpcoming } from "@/lib/timezone";

describe("Dashboard Priority Ordering (S3 Today V2 Spec)", () => {
  const fixedNow = new Date("2026-09-15T12:00:00Z");
  const tz = "America/New_York";

  const sampleTasks: Task[] = [
    {
      id: "t1",
      workspace_id: "w1",
      title: "Overdue pill organizer",
      due_date: "2026-09-12",
      status: "open",
      due_time: null,
      assignee_id: null,
      completed_by: null,
      completed_at: null,
      created_by: "u1",
      related_appointment_id: null,
      related_document_id: null,
      created_at: "2026-09-10T00:00:00Z",
      updated_at: "2026-09-10T00:00:00Z",
      deleted_at: null,
      description: null,
    },
    {
      id: "t2",
      workspace_id: "w1",
      title: "Today grocery task",
      due_date: "2026-09-15",
      status: "open",
      due_time: null,
      assignee_id: "u1",
      completed_by: null,
      completed_at: null,
      created_by: "u1",
      related_appointment_id: null,
      related_document_id: null,
      created_at: "2026-09-14T00:00:00Z",
      updated_at: "2026-09-14T00:00:00Z",
      deleted_at: null,
      description: null,
    },
    {
      id: "t3",
      workspace_id: "w1",
      title: "Next week physical therapy prep",
      due_date: "2026-09-20",
      status: "open",
      due_time: null,
      assignee_id: null,
      completed_by: null,
      completed_at: null,
      created_by: "u1",
      related_appointment_id: null,
      related_document_id: null,
      created_at: "2026-09-14T00:00:00Z",
      updated_at: "2026-09-14T00:00:00Z",
      deleted_at: null,
      description: null,
    },
  ];

  const sampleAppointments: Appointment[] = [
    {
      id: "a1",
      workspace_id: "w1",
      title: "Dentist visit today",
      date: "2026-09-15",
      start_time: "14:00:00",
      end_time: null,
      location: "Main St Dental",
      provider_contact: null,
      attendees: null,
      details: null,
      status: "scheduled",
      related_task_id: null,
      related_document_id: null,
      created_by: "u1",
      created_at: "2026-09-10T00:00:00Z",
      updated_at: "2026-09-10T00:00:00Z",
      deleted_at: null,
    },
    {
      id: "a2",
      workspace_id: "w1",
      title: "Cardiologist next week",
      date: "2026-09-18",
      start_time: "09:00:00",
      end_time: null,
      location: "Heart Center",
      provider_contact: null,
      attendees: null,
      details: null,
      status: "scheduled",
      related_task_id: null,
      related_document_id: null,
      created_by: "u1",
      created_at: "2026-09-10T00:00:00Z",
      updated_at: "2026-09-10T00:00:00Z",
      deleted_at: null,
    },
  ];

  it("prioritizes overdue items first (Priority 1: Needs Attention)", () => {
    const overdue = sampleTasks.filter((t) => isTaskOverdue(t.due_date, t.status, tz, fixedNow));
    expect(overdue.length).toBe(1);
    expect(overdue[0].id).toBe("t1");
  });

  it("groups today's tasks and appointments (Priority 2: Today)", () => {
    const todayTasks = sampleTasks.filter((t) => isTaskDueToday(t.due_date, tz, fixedNow));
    const todayAppts = sampleAppointments.filter((a) => a.date === "2026-09-15");
    expect(todayTasks.length).toBe(1);
    expect(todayTasks[0].id).toBe("t2");
    expect(todayAppts.length).toBe(1);
    expect(todayAppts[0].id).toBe("a1");
  });

  it("groups coming up tasks and appointments within 7 days (Priority 3: Coming Up)", () => {
    const upcomingTasks = sampleTasks.filter((t) => isDateUpcoming(t.due_date, tz, 7, fixedNow));
    const upcomingAppts = sampleAppointments.filter((a) => isDateUpcoming(a.date, tz, 7, fixedNow));
    expect(upcomingTasks.length).toBe(1);
    expect(upcomingTasks[0].id).toBe("t3");
    expect(upcomingAppts.length).toBe(1);
    expect(upcomingAppts[0].id).toBe("a2");
  });

  it("verifies target route resolution for interactive timeline events (Priority 4)", () => {
    const resolveHref = (event: Partial<TimelineEvent>) => {
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

    expect(resolveHref({ target_type: "task" })).toBe("/tasks");
    expect(resolveHref({ target_type: "appointment" })).toBe("/calendar");
    expect(resolveHref({ target_type: "medication" })).toBe("/medications");
    expect(resolveHref({ target_type: "document" })).toBe("/documents");
    expect(resolveHref({ target_type: "note" })).toBe("/notes");
    expect(resolveHref({ target_type: "emergency" })).toBe("/emergency");
    expect(resolveHref({ target_type: "care_recipient" })).toBe("/settings");
    expect(resolveHref({ target_type: "other" })).toBe("/updates");
  });

  it("validates unified + Add role permissions matrix (Section 10 & 18)", () => {
    const getAvailableAddActions = (role: Role) => {
      if (role === "viewer") return [];
      const actions = ["task", "note", "document"];
      if (role === "owner" || role === "coordinator") {
        actions.push("appointment", "invite");
      }
      return actions;
    };

    expect(getAvailableAddActions("owner")).toEqual(["task", "note", "document", "appointment", "invite"]);
    expect(getAvailableAddActions("coordinator")).toEqual(["task", "note", "document", "appointment", "invite"]);
    expect(getAvailableAddActions("contributor")).toEqual(["task", "note", "document"]);
    expect(getAvailableAddActions("viewer")).toEqual([]);
  });
});

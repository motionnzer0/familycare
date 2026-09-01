import { describe, it, expect } from "vitest";
import { createTaskSchema } from "@/lib/validations/task";
import { isTaskOverdue, isTaskDueToday, isDateUpcoming } from "@/lib/timezone";
import { Task } from "@/lib/types";

describe("Tasks Unit & Lifecycle Logic (Phase 1B)", () => {
  const fixedNow = new Date("2026-09-15T12:00:00Z"); // Workspace Local: Sep 15, 2026
  const tz = "America/New_York";

  it("validates task schema properly", () => {
    const valid = createTaskSchema.safeParse({
      title: "Schedule physical therapy",
      dueDate: "2026-09-20",
      dueTime: "14:30",
    });
    expect(valid.success).toBe(true);

    const invalid = createTaskSchema.safeParse({
      title: "",
      dueDate: "not-a-date",
    });
    expect(invalid.success).toBe(false);
  });

  it("correctly identifies overdue tasks", () => {
    const overdueTask: Partial<Task> = {
      title: "Pick up meds",
      due_date: "2026-09-14",
      status: "open",
    };
    expect(isTaskOverdue(overdueTask.due_date, overdueTask.status!, tz, fixedNow)).toBe(true);

    const completedPastTask: Partial<Task> = {
      title: "Old task",
      due_date: "2026-09-10",
      status: "completed",
    };
    expect(isTaskOverdue(completedPastTask.due_date, completedPastTask.status!, tz, fixedNow)).toBe(false);
  });

  it("correctly identifies due-today tasks", () => {
    const todayTask: Partial<Task> = {
      title: "Morning blood pressure check",
      due_date: "2026-09-15",
      status: "open",
    };
    expect(isTaskDueToday(todayTask.due_date, tz, fixedNow)).toBe(true);
  });

  it("correctly identifies upcoming tasks within 7 days", () => {
    const upcomingTask: Partial<Task> = {
      title: "Weekend grocery run",
      due_date: "2026-09-18",
      status: "open",
    };
    expect(isDateUpcoming(upcomingTask.due_date, tz, 7, fixedNow)).toBe(true);

    const farTask: Partial<Task> = {
      title: "Next month checkup prep",
      due_date: "2026-10-15",
      status: "open",
    };
    expect(isDateUpcoming(farTask.due_date, tz, 7, fixedNow)).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import {
  createAppointmentSchema,
  updateAppointmentSchema,
} from "@/lib/validations/appointment";

describe("Appointments Validation & Status Rules (Phase 1C)", () => {
  it("validates full appointment schema", () => {
    const valid = createAppointmentSchema.safeParse({
      title: "Dr. Evans - Oncology Follow-up",
      date: "2026-09-22",
      startTime: "10:00",
      endTime: "11:30",
      location: "Cancer Center Suite 200",
      providerContact: "Dr. Evans (555-0144)",
      attendees: "Sarah and Mark",
      details: "Bring recent blood panel results",
    });
    expect(valid.success).toBe(true);
  });

  it("requires title and valid date", () => {
    const invalid = createAppointmentSchema.safeParse({
      title: "",
      date: "bad-date",
    });
    expect(invalid.success).toBe(false);
  });

  it("validates status transitions in update schema", () => {
    const validStatus = updateAppointmentSchema.safeParse({
      status: "completed",
    });
    expect(validStatus.success).toBe(true);

    const invalidStatus = updateAppointmentSchema.safeParse({
      status: "unknown-status",
    });
    expect(invalidStatus.success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";
import {
  EMERGENCY_SAFETY_BANNER_COPY,
  EMERGENCY_FIELD_PREAMBLE_COPY,
  emergencyContactSchema,
  emergencyInfoSchema,
} from "@/lib/validations/emergency";
import { checkPermission } from "@/lib/permissions";

describe("Emergency Information & Safety Copy (Phase 2B / D-23)", () => {
  it("contains exact approved safety copy", () => {
    expect(EMERGENCY_SAFETY_BANNER_COPY).toContain("For an emergency, call 911 or local emergency services immediately.");
    expect(EMERGENCY_SAFETY_BANNER_COPY).toContain("does not provide emergency response, medical dispatch, or clinical advice.");

    expect(EMERGENCY_FIELD_PREAMBLE_COPY).toContain("All details below are entered and maintained by your family.");
    expect(EMERGENCY_FIELD_PREAMBLE_COPY).toContain("Confirm medical questions with a healthcare professional.");
  });

  it("validates emergency contact schema", () => {
    const valid = emergencyContactSchema.safeParse({
      name: "Dr. Sarah Jenkins",
      phone: "(555) 234-5678",
      relationship: "Cardiologist",
      isPrimary: true,
      sortOrder: 0,
    });
    expect(valid.success).toBe(true);

    const invalid = emergencyContactSchema.safeParse({
      name: "",
      phone: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces emergency permissions (Full Read / Tiered Write - D-17)", () => {
    // All roles can READ emergency information
    expect(checkPermission("owner", "emergency", "read")).toBe(true);
    expect(checkPermission("coordinator", "emergency", "read")).toBe(true);
    expect(checkPermission("contributor", "emergency", "read")).toBe(true);
    expect(checkPermission("viewer", "emergency", "read")).toBe(true);

    // Only Owner and Coordinator can EDIT emergency information
    expect(checkPermission("owner", "emergency", "update")).toBe(true);
    expect(checkPermission("coordinator", "emergency", "update")).toBe(true);
    expect(checkPermission("contributor", "emergency", "update")).toBe(false);
    expect(checkPermission("viewer", "emergency", "update")).toBe(false);
  });
});

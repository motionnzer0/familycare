import { describe, it, expect } from "vitest";
import {
  createMedicationSchema,
  updateMedicationSchema,
} from "@/lib/validations/medication";
import { checkPermission } from "@/lib/permissions";

describe("Medications Reference (Phase 2C)", () => {
  it("validates medication reference creation", () => {
    const valid = createMedicationSchema.safeParse({
      name: "Atorvastatin",
      dosage: "20 mg",
      instructions: "Take once daily at bedtime",
      frequency: "Once daily",
      schedule: "Night",
      prescribingProvider: "Dr. Smith",
      status: "active",
    });
    expect(valid.success).toBe(true);

    const invalid = createMedicationSchema.safeParse({
      name: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("enforces medication permissions (Non-clinical family reference)", () => {
    // All roles can READ medications
    expect(checkPermission("owner", "medication", "read")).toBe(true);
    expect(checkPermission("coordinator", "medication", "read")).toBe(true);
    expect(checkPermission("contributor", "medication", "read")).toBe(true);
    expect(checkPermission("viewer", "medication", "read")).toBe(true);

    // Only Owner/Coordinator can CREATE or UPDATE medications
    expect(checkPermission("owner", "medication", "create")).toBe(true);
    expect(checkPermission("coordinator", "medication", "create")).toBe(true);
    expect(checkPermission("contributor", "medication", "create")).toBe(false);
    expect(checkPermission("viewer", "medication", "create")).toBe(false);
  });
});

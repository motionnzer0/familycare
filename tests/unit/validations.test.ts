import { describe, it, expect } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { createWorkspaceSchema } from "@/lib/validations/workspace";
import { createTaskSchema } from "@/lib/validations/task";
import { emergencyContactSchema, emergencyInfoSchema } from "@/lib/validations/emergency";

describe("Validation Schemas", () => {
  describe("Auth Schemas", () => {
    it("validates login input", () => {
      const valid = loginSchema.safeParse({
        email: "caregiver@example.com",
        password: "securepassword",
      });
      expect(valid.success).toBe(true);

      const invalidEmail = loginSchema.safeParse({
        email: "not-an-email",
        password: "securepassword",
      });
      expect(invalidEmail.success).toBe(false);
    });

    it("requires at least 8 character password for registration", () => {
      const shortPass = registerSchema.safeParse({
        fullName: "Sarah Caregiver",
        email: "sarah@example.com",
        password: "short",
      });
      expect(shortPass.success).toBe(false);
    });
  });

  describe("Workspace Schemas", () => {
    it("validates workspace creation requirements", () => {
      const valid = createWorkspaceSchema.safeParse({
        name: "Care for Dad",
        timezone: "America/New_York",
        careRecipientPreferredName: "Dad",
      });
      expect(valid.success).toBe(true);

      const missingRecipient = createWorkspaceSchema.safeParse({
        name: "Care for Dad",
        timezone: "America/New_York",
        careRecipientPreferredName: "",
      });
      expect(missingRecipient.success).toBe(false);
    });
  });

  describe("Task Schemas", () => {
    it("validates task title requirement and optional fields", () => {
      const validMin = createTaskSchema.safeParse({
        title: "Pick up prescription",
      });
      expect(validMin.success).toBe(true);

      const missingTitle = createTaskSchema.safeParse({
        title: "",
      });
      expect(missingTitle.success).toBe(false);
    });
  });

  describe("Emergency Schemas (D-23)", () => {
    it("validates emergency contacts", () => {
      const validContact = emergencyContactSchema.safeParse({
        name: "Dr. Smith",
        phone: "555-0199",
        relationship: "Primary Care Doctor",
        isPrimary: true,
        sortOrder: 0,
      });
      expect(validContact.success).toBe(true);
    });

    it("validates free-text emergency info fields", () => {
      const validInfo = emergencyInfoSchema.safeParse({
        preferredHospital: "St. Jude Hospital",
        allergiesConditions: "Penicillin allergy, Type 2 Diabetes",
        insuranceInfo: "Medicare Part A & B",
        additionalNotes: "Key under front porch planter",
      });
      expect(validInfo.success).toBe(true);
    });
  });
});

import { describe, it, expect } from "vitest";
import { checkPermission } from "@/lib/permissions";

describe("Permission Checker (D-17 / OQ-02 Option A)", () => {
  describe("Viewer Role", () => {
    it("allows read access to all categories", () => {
      expect(checkPermission("viewer", "task", "read")).toBe(true);
      expect(checkPermission("viewer", "appointment", "read")).toBe(true);
      expect(checkPermission("viewer", "medication", "read")).toBe(true);
      expect(checkPermission("viewer", "document", "read")).toBe(true);
      expect(checkPermission("viewer", "emergency", "read")).toBe(true);
      expect(checkPermission("viewer", "note", "read")).toBe(true);
      expect(checkPermission("viewer", "care_recipient", "read")).toBe(true);
    });

    it("denies all write, create, edit, delete, and complete actions", () => {
      expect(checkPermission("viewer", "task", "create")).toBe(false);
      expect(checkPermission("viewer", "task", "update")).toBe(false);
      expect(checkPermission("viewer", "task", "complete")).toBe(false);
      expect(checkPermission("viewer", "medication", "create")).toBe(false);
      expect(checkPermission("viewer", "medication", "update")).toBe(false);
      expect(checkPermission("viewer", "document", "upload")).toBe(false);
      expect(checkPermission("viewer", "emergency", "update")).toBe(false);
      expect(checkPermission("viewer", "note", "create")).toBe(false);
      expect(checkPermission("viewer", "member", "invite")).toBe(false);
    });
  });

  describe("Contributor Role", () => {
    it("allows reading all categories", () => {
      expect(checkPermission("contributor", "medication", "read")).toBe(true);
      expect(checkPermission("contributor", "emergency", "read")).toBe(true);
      expect(checkPermission("contributor", "document", "read")).toBe(true);
    });

    it("allows creating and editing own notes", () => {
      expect(checkPermission("contributor", "note", "create")).toBe(true);
      expect(checkPermission("contributor", "note", "update", { isCreator: true })).toBe(true);
      expect(checkPermission("contributor", "note", "update", { isCreator: false })).toBe(false);
    });

    it("allows uploading documents and editing own document metadata", () => {
      expect(checkPermission("contributor", "document", "upload")).toBe(true);
      expect(checkPermission("contributor", "document", "update", { isCreator: true })).toBe(true);
      expect(checkPermission("contributor", "document", "update", { isCreator: false })).toBe(false);
      expect(checkPermission("contributor", "document", "delete")).toBe(false);
    });

    it("allows completing own or unassigned tasks, but not assigning to others", () => {
      expect(checkPermission("contributor", "task", "create")).toBe(true);
      expect(checkPermission("contributor", "task", "complete", { isAssignee: true })).toBe(true);
      expect(checkPermission("contributor", "task", "complete", { isUnassigned: true })).toBe(true);
      expect(checkPermission("contributor", "task", "complete", { isAssignee: false, isUnassigned: false })).toBe(false);
      expect(checkPermission("contributor", "task", "assign")).toBe(false);
    });

    it("denies editing care profile, medications, or emergency info", () => {
      expect(checkPermission("contributor", "care_recipient", "update")).toBe(false);
      expect(checkPermission("contributor", "medication", "create")).toBe(false);
      expect(checkPermission("contributor", "medication", "update")).toBe(false);
      expect(checkPermission("contributor", "emergency", "update")).toBe(false);
    });
  });

  describe("Coordinator Role", () => {
    it("allows full CRUD on care records", () => {
      expect(checkPermission("coordinator", "task", "create")).toBe(true);
      expect(checkPermission("coordinator", "task", "assign")).toBe(true);
      expect(checkPermission("coordinator", "appointment", "create")).toBe(true);
      expect(checkPermission("coordinator", "medication", "create")).toBe(true);
      expect(checkPermission("coordinator", "medication", "update")).toBe(true);
      expect(checkPermission("coordinator", "emergency", "update")).toBe(true);
      expect(checkPermission("coordinator", "care_recipient", "update")).toBe(true);
    });

    it("denies workspace deletion and ownership transfer", () => {
      expect(checkPermission("coordinator", "workspace", "delete")).toBe(false);
      expect(checkPermission("coordinator", "workspace", "assign")).toBe(false);
    });
  });

  describe("Owner Role", () => {
    it("allows all operations", () => {
      expect(checkPermission("owner", "workspace", "delete")).toBe(true);
      expect(checkPermission("owner", "member", "delete")).toBe(true);
      expect(checkPermission("owner", "emergency", "update")).toBe(true);
      expect(checkPermission("owner", "medication", "create")).toBe(true);
    });
  });
});

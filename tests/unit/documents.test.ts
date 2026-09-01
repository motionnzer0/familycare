import { describe, it, expect } from "vitest";
import {
  createDocumentSchema,
  updateDocumentSchema,
  DOCUMENT_CATEGORIES,
} from "@/lib/validations/document";
import { checkPermission } from "@/lib/permissions";

describe("Documents Management (Phase 2D)", () => {
  it("enforces 25MB file size limit and valid category", () => {
    const valid = createDocumentSchema.safeParse({
      title: "Health Care Proxy Signed",
      category: "Legal",
      filePath: "uploads/proxy.pdf",
      fileSize: 5 * 1024 * 1024, // 5MB
      mimeType: "application/pdf",
      isEmergencyAccess: true,
    });
    expect(valid.success).toBe(true);

    const oversized = createDocumentSchema.safeParse({
      title: "Scans",
      category: "Medical",
      filePath: "uploads/large.zip",
      fileSize: 30 * 1024 * 1024, // 30MB (> 25MB limit)
      mimeType: "application/zip",
    });
    expect(oversized.success).toBe(false);
  });

  it("enforces document upload and edit permissions", () => {
    // Contributor CAN upload
    expect(checkPermission("contributor", "document", "upload")).toBe(true);

    // Contributor CAN edit metadata of OWN uploads
    expect(checkPermission("contributor", "document", "update", { isCreator: true })).toBe(true);

    // Contributor CANNOT edit metadata of OTHER users' uploads
    expect(checkPermission("contributor", "document", "update", { isCreator: false })).toBe(false);

    // Contributor CANNOT delete documents
    expect(checkPermission("contributor", "document", "delete")).toBe(false);

    // Viewer is read-only
    expect(checkPermission("viewer", "document", "upload")).toBe(false);
    expect(checkPermission("viewer", "document", "update")).toBe(false);
    expect(checkPermission("viewer", "document", "delete")).toBe(false);
  });
});

import { z } from "zod";

export const DOCUMENT_CATEGORIES = [
  "Insurance",
  "Medical",
  "Legal",
  "Financial",
  "Identification",
  "Other",
] as const;

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Document title is required").max(200),
  category: z.enum(DOCUMENT_CATEGORIES),
  filePath: z.string().min(1, "File path is required"),
  fileSize: z.number().max(25 * 1024 * 1024, "Maximum file size is 25MB"),
  mimeType: z.string().min(1),
  isEmergencyAccess: z.boolean().default(false),
  notes: z.string().max(1000).optional().nullable(),
});

export const updateDocumentSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  category: z.enum(DOCUMENT_CATEGORIES).optional(),
  isEmergencyAccess: z.boolean().optional(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

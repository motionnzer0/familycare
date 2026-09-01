import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").max(200, "Title is too long"),
  description: z.string().max(2000).optional().nullable(),
  assigneeId: z.string().uuid().optional().nullable(),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional().nullable(),
  dueTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid time format (HH:MM)").optional().nullable(),
  relatedAppointmentId: z.string().uuid().optional().nullable(),
  relatedDocumentId: z.string().uuid().optional().nullable(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;

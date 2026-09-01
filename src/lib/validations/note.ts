import { z } from "zod";

export const NOTE_CATEGORIES = [
  "General",
  "Appointment",
  "Family",
  "Care",
  "Other",
] as const;

export const createNoteSchema = z.object({
  title: z.string().min(1, "Note title is required").max(200),
  body: z.string().min(1, "Note content cannot be empty").max(10000),
  category: z.enum(NOTE_CATEGORIES).default("General"),
  relatedAppointmentId: z.string().uuid().optional().nullable(),
  relatedTaskId: z.string().uuid().optional().nullable(),
});

export const updateNoteSchema = createNoteSchema.partial();

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;

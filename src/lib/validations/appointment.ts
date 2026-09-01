import { z } from "zod";

export const createAppointmentSchema = z.object({
  title: z.string().min(1, "Appointment title is required").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date is required (YYYY-MM-DD)"),
  startTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid start time").optional().nullable(),
  endTime: z.string().regex(/^\d{2}:\d{2}(:\d{2})?$/, "Invalid end time").optional().nullable(),
  location: z.string().max(200).optional().nullable(),
  providerContact: z.string().max(200).optional().nullable(),
  attendees: z.string().max(200).optional().nullable(),
  details: z.string().max(2000).optional().nullable(),
  relatedTaskId: z.string().uuid().optional().nullable(),
});

export const updateAppointmentSchema = createAppointmentSchema.partial().extend({
  status: z.enum(["scheduled", "completed", "cancelled"]).optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type UpdateAppointmentInput = z.infer<typeof updateAppointmentSchema>;

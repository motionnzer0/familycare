import { z } from "zod";

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Workspace name is required").max(100),
  timezone: z.string().default("America/New_York"),
  careRecipientPreferredName: z.string().min(1, "Care recipient's preferred name is required").max(100),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;

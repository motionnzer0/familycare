import { z } from "zod";

export const inviteMemberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["coordinator", "contributor", "viewer"], {
    errorMap: () => ({ message: "Role must be Coordinator, Contributor, or Viewer" }),
  }),
});

export const updateMemberRoleSchema = z.object({
  memberId: z.string().uuid("Invalid member ID"),
  role: z.enum(["coordinator", "contributor", "viewer"], {
    errorMap: () => ({ message: "Role must be Coordinator, Contributor, or Viewer" }),
  }),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleSchema>;

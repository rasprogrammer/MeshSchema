import { z } from "zod";

export const createInviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["EDITOR", "VIEWER"]),
});

export const inviteIdParamSchema = z.object({
  id: z.string().uuid("Invalid project id"),
  inviteId: z.string().uuid("Invalid invite id"),
});

export const acceptInviteParamSchema = z.object({
  token: z.string().min(1),
});

export type CreateInviteInput = z.infer<typeof createInviteSchema>;

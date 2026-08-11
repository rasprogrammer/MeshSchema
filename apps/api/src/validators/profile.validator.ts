import z from "zod";

export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
});

const passwordSchema = z.string().min(8, "Password must be at least 8 characters").max(100);

export const updatePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
  confirmPassword: passwordSchema,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
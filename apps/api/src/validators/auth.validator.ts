import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1).optional(),
});

export const twoFactorVerifyLoginSchema = z.object({
  twoFactorToken: z.string().min(1, "twoFactorToken is required"),
  code: z.string().length(6, "Code must be 6 digits"),
});

export const twoFactorCodeSchema = z.object({
  code: z.string().length(6, "Code must be 6 digits"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

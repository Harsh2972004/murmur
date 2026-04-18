import * as z from "zod";

export const resetPasswordSchema = z
  .object({
    code: z.string().length(6, { message: "Reset code must be 6 digits" }),
    newPassword: z
      .string()
      .min(8, { message: "password must be at least 8 characters." }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

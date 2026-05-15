import * as z from "zod";

// Form schema
export const anonymousChatFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
  expiresAt: z.string().optional(),
});

// API schema
export const anonymousChatSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
  expiresAt: z.coerce.date().optional(),
});

export type AnonymousChatFormInput = z.infer<typeof anonymousChatFormSchema>;
export type AnonymousChatInput = z.infer<typeof anonymousChatSchema>;

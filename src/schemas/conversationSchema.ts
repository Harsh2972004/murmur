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

//direct chat
export const directChatSchema = z.object({
  recipientName: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name too long")
    .trim(),
});

// group chat

export const groupChatSchema = z.object({
  groupName: z
    .string()
    .min(1, "Group name is required")
    .max(20, "Group name too long"),
  participants: z.array(
    z.string().min(2, "At least two participants are required"),
  ),
});

export type GroupChatInput = z.infer<typeof groupChatSchema>;

export type AnonymousChatFormInput = z.infer<typeof anonymousChatFormSchema>;
export type AnonymousChatInput = z.infer<typeof anonymousChatSchema>;

export type DirectChatInput = z.infer<typeof directChatSchema>;

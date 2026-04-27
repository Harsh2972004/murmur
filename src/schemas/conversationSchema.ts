import * as z from "zod";

export const conversationNameSchema = z.object({
  name: z.string().min(1, "Name is required").max(50, "Name too long").trim(),
});

export const anonymousChatSchema = conversationNameSchema.extend({
  expiresAt: z.coerce.date().optional(),
});

export type ConversationNameInput = z.infer<typeof conversationNameSchema>;

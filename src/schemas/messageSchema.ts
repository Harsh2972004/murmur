import * as z from "zod";

const baseMessageContentSchema = z
  .string()
  .trim()
  .max(300, "Content must be no longer than 300 Characters.");

export const messageSchema = z.object({
  content: baseMessageContentSchema.min(1, {
    message: "Message cannot be empty.",
  }),
  tempId: z.uuid().optional(),
});

export const anonymousMessageSchema = z.object({
  content: baseMessageContentSchema.min(10, {
    message: "Content must be at least 10 characters.",
  }),
  tempId: z.uuid().optional(),
});

export type messageContentInput = z.infer<typeof messageSchema>;

export type anonymousMessageContentInput = z.infer<
  typeof anonymousMessageSchema
>;

import { z } from "zod";

export const addFriendSchema = z.object({
  friendName: z
    .string()
    .min(1, "Username is required")
    .max(20, "Username too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

export type AddFriendInput = z.infer<typeof addFriendSchema>;

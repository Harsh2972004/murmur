import { z } from "zod";

export const SendFriendRequestSchema = z.object({
  friendName: z
    .string()
    .min(1, "Username is required")
    .max(20, "Username too long")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores",
    ),
});

export const respondToRequestSchema = z.object({
  requestId: z.string(),
  action: z.enum(["accepted", "rejected"]),
});

export type AddFriendInput = z.infer<typeof SendFriendRequestSchema>;

import * as z from "zod";

export const messageSchema = z.object({
  username: z.string(),
  content: z
    .string()
    .min(10, { message: "content must be of at least 10 characters" })
    .max(300, "Content must be no longer than 300 Characters."),
});

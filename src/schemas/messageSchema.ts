import * as z from "zod";

export const messageSchema = z.object({
  content: z
    .string()
    .min(10, { message: "content must of at least 10 characters" })
    .max(300, "Content must be no longer than 300 Characters."),
});

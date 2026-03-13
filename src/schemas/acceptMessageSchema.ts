import * as z from "zod";

export const acceptMessageSchema = z.object({
  acceptMessages: z.boolean(),
  password: z.string(),
});

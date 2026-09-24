import { z } from "zod";

export const friendUserIdSchema = z.object({
  friendUserId: z.string().trim().min(1),
});

export type TFriendUserIdFormData = z.infer<typeof friendUserIdSchema>;

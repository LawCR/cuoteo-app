import { z } from "zod";

export const friendRequestIdSchema = z.object({
  friendRequestId: z.string().trim().min(1),
});

export type TFriendRequestIdFormData = z.infer<typeof friendRequestIdSchema>;

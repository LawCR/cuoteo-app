import { z } from "zod";
import { FRIEND_LOOKUP_MAX_LENGTH } from "@/features/friends/constants/friends.constants";

export const sendFriendRequestSchema = z.object({
  query: z
    .string()
    .trim()
    .min(1, "Escribe un usuario o correo exacto.")
    .max(FRIEND_LOOKUP_MAX_LENGTH),
});

export type TSendFriendRequestFormData = z.infer<typeof sendFriendRequestSchema>;

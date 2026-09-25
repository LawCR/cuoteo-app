import { z } from "zod";

export const addFriendToPlanSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
  friendUserId: z.string().min(1, "Elige un amigo."),
  includeInPastExpenses: z.boolean(),
});

export type TAddFriendToPlanFormData = z.infer<typeof addFriendToPlanSchema>;

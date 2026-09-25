import { z } from "zod";

export const movePlanToBalanceSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TMovePlanToBalanceFormData = z.infer<typeof movePlanToBalanceSchema>;

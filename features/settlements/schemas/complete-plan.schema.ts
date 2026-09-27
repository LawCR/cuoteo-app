import { z } from "zod";

export const completePlanSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TCompletePlanPayload = z.infer<typeof completePlanSchema>;

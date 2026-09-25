import { z } from "zod";

export const movePlanToActiveSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TMovePlanToActiveFormData = z.infer<typeof movePlanToActiveSchema>;

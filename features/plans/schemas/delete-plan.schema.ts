import { z } from "zod";

export const deletePlanSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TDeletePlanFormData = z.infer<typeof deletePlanSchema>;

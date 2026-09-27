import { z } from "zod";

export const wipePlanPaymentsSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TWipePlanPaymentsFormData = z.infer<typeof wipePlanPaymentsSchema>;

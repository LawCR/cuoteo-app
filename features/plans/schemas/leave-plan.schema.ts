import { z } from "zod";

export const leavePlanSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TLeavePlanFormData = z.infer<typeof leavePlanSchema>;

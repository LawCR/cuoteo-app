import { z } from "zod";

export const completePaymentsSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
});

export type TCompletePaymentsPayload = z.infer<typeof completePaymentsSchema>;

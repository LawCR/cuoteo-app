import { z } from "zod";

export const voidPaymentSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
  paymentId: z.string().min(1, "El pago no es válido."),
});

export type TVoidPaymentPayload = z.infer<typeof voidPaymentSchema>;

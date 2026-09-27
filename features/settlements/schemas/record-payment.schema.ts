import { z } from "zod";

const penAmountSchema = z
  .string()
  .trim()
  .min(1, "Escribe el monto.")
  .regex(/^\d+([.,]\d{1,2})?$/, "Usa un monto con hasta 2 decimales.")
  .refine((value) => {
    const amount = Number(value.replace(",", "."));
    return amount > 0;
  }, "El monto debe ser mayor a 0.");

export const recordPaymentFormSchema = z.object({
  fromMemberId: z.string().min(1, "Elige quién paga."),
  amount: penAmountSchema,
});

export const recordPaymentSchema = recordPaymentFormSchema.extend({
  planId: z.string().min(1, "El plan no es válido."),
  toMemberId: z.string().min(1, "El acreedor no es válido."),
});

export type TRecordPaymentFormData = z.infer<typeof recordPaymentFormSchema>;
export type TRecordPaymentPayload = z.infer<typeof recordPaymentSchema>;

export function parsePaymentAmount(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}

import { z } from "zod";
import {
  EXPENSE_TITLE_MAX_LENGTH,
  MAX_EXPENSE_AMOUNT,
} from "@/features/expenses/constants/expenses.constants";
import { EXPENSE_CATEGORY_VALUES } from "@/shared/constants/expense-category.constants";

const penAmountSchema = z
  .string()
  .trim()
  .min(1, "Escribe el monto.")
  .regex(/^\d+([.,]\d{1,2})?$/, "Usa un monto con hasta 2 decimales.")
  .refine((value) => {
    const amount = Number(value.replace(",", "."));
    return amount > 0;
  }, "El monto debe ser mayor a 0.")
  .refine((value) => {
    const amount = Number(value.replace(",", "."));
    return amount <= MAX_EXPENSE_AMOUNT;
  }, "El monto es demasiado alto.");

export const expenseFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Escribe el concepto.")
    .max(
      EXPENSE_TITLE_MAX_LENGTH,
      `Usa como máximo ${EXPENSE_TITLE_MAX_LENGTH} caracteres.`,
    ),
  amount: penAmountSchema,
  category: z.enum(EXPENSE_CATEGORY_VALUES, { error: "Elige una categoría." }),
  paidByMemberId: z.string().min(1, "Elige quién pagó."),
  shareMemberIds: z
    .array(z.string().min(1))
    .min(1, "Elige al menos un integrante.")
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Cada integrante solo puede aparecer una vez.",
    ),
});

export const createExpenseSchema = expenseFormSchema.extend({
  planId: z.string().min(1, "El plan no es válido."),
});

export const updateExpenseSchema = createExpenseSchema.extend({
  expenseId: z.string().min(1, "El gasto no es válido."),
});

export const deleteExpenseSchema = z.object({
  planId: z.string().min(1, "El plan no es válido."),
  expenseId: z.string().min(1, "El gasto no es válido."),
});

export type TExpenseFormData = z.infer<typeof expenseFormSchema>;
export type TCreateExpenseFormData = z.infer<typeof createExpenseSchema>;
export type TUpdateExpenseFormData = z.infer<typeof updateExpenseSchema>;
export type TDeleteExpenseFormData = z.infer<typeof deleteExpenseSchema>;

export function parseExpenseAmount(raw: string): number {
  return Number(raw.trim().replace(",", "."));
}

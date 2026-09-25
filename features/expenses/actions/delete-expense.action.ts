"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TDeleteExpenseActionState } from "@/features/expenses/interfaces/expense.interface";
import {
  deleteExpenseSchema,
  type TDeleteExpenseFormData,
} from "@/features/expenses/schemas/expense.schema";
import { deleteExpense } from "@/features/expenses/services/server/expense-service.server";

export async function deleteExpenseAction(
  input: TDeleteExpenseFormData,
): Promise<TDeleteExpenseActionState> {
  const user = await requireAppUser();
  const parsed = deleteExpenseSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese gasto.", success: false };
  }

  try {
    await deleteExpense({
      actorUserId: user.id,
      planId: parsed.data.planId,
      expenseId: parsed.data.expenseId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese gasto.", success: false };
    }

    if (error instanceof ValidationError) {
      return {
        error: "Los gastos se pueden eliminar solo cuando el plan está activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo eliminar el gasto. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TUpdateExpenseActionState } from "@/features/expenses/interfaces/expense.interface";
import {
  parseExpenseAmount,
  updateExpenseSchema,
  type TUpdateExpenseFormData,
} from "@/features/expenses/schemas/expense.schema";
import { updateExpense } from "@/features/expenses/services/server/expense-service.server";

export async function updateExpenseAction(
  input: TUpdateExpenseFormData,
): Promise<TUpdateExpenseActionState> {
  const user = await requireAppUser();
  const parsed = updateExpenseSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Revisa el concepto, el monto y quiénes participan.",
      success: false,
    };
  }

  try {
    await updateExpense({
      actorUserId: user.id,
      planId: parsed.data.planId,
      expenseId: parsed.data.expenseId,
      title: parsed.data.title,
      amount: parseExpenseAmount(parsed.data.amount),
      category: parsed.data.category,
      paidByMemberId: parsed.data.paidByMemberId,
      shareMemberIds: parsed.data.shareMemberIds,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese gasto.", success: false };
    }

    if (error instanceof ValidationError) {
      if (error.message === "plan_not_active") {
        return {
          error: "Los gastos se pueden editar solo cuando el plan está activo.",
          success: false,
        };
      }

      if (error.message === "not_enough_members") {
        return {
          error: "Necesitas al menos 2 integrantes para editar un gasto.",
          success: false,
        };
      }

      return {
        error: "No se pudo guardar el gasto. Revisa los datos.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo guardar el gasto. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

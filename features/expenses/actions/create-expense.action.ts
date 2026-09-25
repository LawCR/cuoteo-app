"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TCreateExpenseActionState } from "@/features/expenses/interfaces/expense.interface";
import {
  createExpenseSchema,
  parseExpenseAmount,
  type TCreateExpenseFormData,
} from "@/features/expenses/schemas/expense.schema";
import { createExpense } from "@/features/expenses/services/server/expense-service.server";

function mapExpenseActionError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese plan.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "not_enough_members") {
      return "Necesitas al menos 2 integrantes para registrar un gasto.";
    }

    if (error.message === "plan_not_active") {
      return "Los gastos se pueden crear solo cuando el plan está activo.";
    }

    if (error.message === "invalid_payer") {
      return "Elige un pagador que sea integrante del plan.";
    }

    if (
      error.message === "invalid_share_member" ||
      error.message === "no_share_members"
    ) {
      return "Elige al menos un integrante para dividir el gasto.";
    }

    return "No se pudo guardar el gasto. Revisa los datos.";
  }

  if (error instanceof AppError) {
    return "No se pudo guardar el gasto. Inténtalo de nuevo.";
  }

  return null;
}

export async function createExpenseAction(
  input: TCreateExpenseFormData,
): Promise<TCreateExpenseActionState> {
  const user = await requireAppUser();
  const parsed = createExpenseSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Revisa el concepto, el monto y quiénes participan.", success: false };
  }

  try {
    await createExpense({
      actorUserId: user.id,
      planId: parsed.data.planId,
      title: parsed.data.title,
      amount: parseExpenseAmount(parsed.data.amount),
      category: parsed.data.category,
      paidByMemberId: parsed.data.paidByMemberId,
      shareMemberIds: parsed.data.shareMemberIds,
    });
  } catch (error: unknown) {
    const mapped = mapExpenseActionError(error);

    if (mapped) {
      return { error: mapped, success: false };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

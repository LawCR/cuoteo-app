"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TMovePlanToBalanceActionState } from "@/features/plans/interfaces/plan.interface";
import {
  movePlanToBalanceSchema,
  type TMovePlanToBalanceFormData,
} from "@/features/plans/schemas/move-plan-to-balance.schema";
import { movePlanToBalance } from "@/features/plans/services/server/plan-service.server";
import { formatExpensesMissingShareMembersMessage } from "@/features/plans/utils/plan-balance-messages.utils";

export async function movePlanToBalanceAction(
  input: TMovePlanToBalanceFormData,
): Promise<TMovePlanToBalanceActionState> {
  const user = await requireAppUser();
  const parsed = movePlanToBalanceSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await movePlanToBalance({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ValidationError) {
      if (error.message === "not_enough_members") {
        return {
          error: "Necesitas al menos 2 integrantes para pasar a Balance.",
          success: false,
        };
      }

      if (error.message === "not_enough_expenses") {
        return {
          error: "Necesitas al menos 1 gasto para pasar a Balance.",
          success: false,
        };
      }

      if (error.message === "expenses_missing_share_members") {
        const titles = Array.isArray(error.meta?.expenseTitles)
          ? error.meta.expenseTitles.filter(
              (title): title is string => typeof title === "string",
            )
          : [];

        return {
          error: formatExpensesMissingShareMembersMessage(titles),
          success: false,
        };
      }

      return {
        error: "Solo puedes pasar a Balance cuando el plan está activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo pasar a Balance. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/planes");
  revalidatePath(`/planes/${parsed.data.planId}`);
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

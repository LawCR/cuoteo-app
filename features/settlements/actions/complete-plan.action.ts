"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TCompletePlanActionState } from "@/features/settlements/interfaces/settlement.interface";
import {
  completePlanSchema,
  type TCompletePlanPayload,
} from "@/features/settlements/schemas/complete-plan.schema";
import { completePlan } from "@/features/settlements/services/server/settlement-service.server";

function mapCompletePlanError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese plan.";
  }

  if (error instanceof UnauthorizedError) {
    return "Solo el creador puede completar el plan.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "balances_not_settled") {
      return "Primero deja los saldos en cero para completar el plan.";
    }

    return "El plan se completa solo cuando está en Balance.";
  }

  if (error instanceof AppError) {
    return "No se pudo completar el plan. Inténtalo de nuevo.";
  }

  return null;
}

export async function completePlanAction(
  input: TCompletePlanPayload,
): Promise<TCompletePlanActionState> {
  const user = await requireAppUser();
  const parsed = completePlanSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await completePlan({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    const mapped = mapCompletePlanError(error);

    if (mapped) {
      return { error: mapped, success: false };
    }

    throw error;
  }

  revalidatePath("/planes");
  revalidatePath(`/planes/${parsed.data.planId}`);
  revalidatePath("/dashboard");
  return { error: null, success: true };
}

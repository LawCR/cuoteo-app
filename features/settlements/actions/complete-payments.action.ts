"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TCompletePaymentsActionState } from "@/features/settlements/interfaces/settlement.interface";
import {
  completePaymentsSchema,
  type TCompletePaymentsPayload,
} from "@/features/settlements/schemas/complete-payments.schema";
import { completePayments } from "@/features/settlements/services/server/settlement-service.server";

function mapCompletePaymentsError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese plan.";
  }

  if (error instanceof UnauthorizedError) {
    return "Solo el creador puede completar los pagos.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "plan_not_in_balance") {
      return "Los pagos se completan solo cuando el plan está en balance.";
    }

    if (error.message === "already_settled") {
      return "Los saldos ya están en cero.";
    }

    return "No se pudieron completar los pagos. Revisa los datos.";
  }

  if (error instanceof AppError) {
    return "No se pudieron completar los pagos. Inténtalo de nuevo.";
  }

  return null;
}

export async function completePaymentsAction(
  input: TCompletePaymentsPayload,
): Promise<TCompletePaymentsActionState> {
  const user = await requireAppUser();
  const parsed = completePaymentsSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await completePayments({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    const mapped = mapCompletePaymentsError(error);

    if (mapped) {
      return { error: mapped, success: false };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TVoidPaymentActionState } from "@/features/settlements/interfaces/settlement.interface";
import {
  voidPaymentSchema,
  type TVoidPaymentPayload,
} from "@/features/settlements/schemas/void-payment.schema";
import { voidPayment } from "@/features/settlements/services/server/settlement-service.server";

function mapVoidPaymentError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese pago.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "plan_not_in_balance") {
      return "Los pagos se pueden anular solo cuando el plan está en balance.";
    }

    return "No se pudo anular el pago. Revisa los datos.";
  }

  if (error instanceof AppError) {
    return "No se pudo anular el pago. Inténtalo de nuevo.";
  }

  return null;
}

export async function voidPaymentAction(
  input: TVoidPaymentPayload,
): Promise<TVoidPaymentActionState> {
  const user = await requireAppUser();
  const parsed = voidPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese pago.", success: false };
  }

  try {
    await voidPayment({
      actorUserId: user.id,
      planId: parsed.data.planId,
      paymentId: parsed.data.paymentId,
    });
  } catch (error: unknown) {
    const mapped = mapVoidPaymentError(error);

    if (mapped) {
      return { error: mapped, success: false };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TRecordPaymentActionState } from "@/features/settlements/interfaces/settlement.interface";
import {
  parsePaymentAmount,
  recordPaymentSchema,
  type TRecordPaymentPayload,
} from "@/features/settlements/schemas/record-payment.schema";
import { recordTransferPayment } from "@/features/settlements/services/server/settlement-service.server";

function mapRecordPaymentError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese plan.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "plan_not_in_balance") {
      return "Los pagos se registran solo cuando el plan está en balance.";
    }

    if (error.message === "same_member" || error.message === "invalid_payer") {
      return "Elige un deudor distinto al acreedor.";
    }

    if (error.message === "invalid_payee") {
      return "Ese integrante no es un acreedor de este plan.";
    }

    if (error.message === "amount_exceeds_cap") {
      return "El monto supera el tope de este pago.";
    }

    return "No se pudo registrar el pago. Revisa los datos.";
  }

  if (error instanceof AppError) {
    return "No se pudo registrar el pago. Inténtalo de nuevo.";
  }

  return null;
}

export async function recordTransferPaymentAction(
  input: TRecordPaymentPayload,
): Promise<TRecordPaymentActionState> {
  const user = await requireAppUser();
  const parsed = recordPaymentSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Revisa quién paga y el monto.", success: false };
  }

  try {
    await recordTransferPayment({
      actorUserId: user.id,
      planId: parsed.data.planId,
      fromMemberId: parsed.data.fromMemberId,
      toMemberId: parsed.data.toMemberId,
      amount: parsePaymentAmount(parsed.data.amount),
    });
  } catch (error: unknown) {
    const mapped = mapRecordPaymentError(error);

    if (mapped) {
      return { error: mapped, success: false };
    }

    throw error;
  }

  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TWipePlanPaymentsActionState } from "@/features/plans/interfaces/plan.interface";
import {
  wipePlanPaymentsSchema,
  type TWipePlanPaymentsFormData,
} from "@/features/plans/schemas/wipe-plan-payments.schema";
import { wipePlanPaymentsAndMoveToActive } from "@/features/plans/services/server/plan-service.server";

function mapWipePlanPaymentsError(error: unknown): string | null {
  if (error instanceof NotFoundError) {
    return "No encontramos ese plan.";
  }

  if (error instanceof UnauthorizedError) {
    return "Solo el creador puede borrar los pagos y volver a Activo.";
  }

  if (error instanceof ValidationError) {
    if (error.message === "no_payments") {
      return "No hay pagos que borrar. Usa Volver a Activo.";
    }

    return "Solo puedes borrar los pagos cuando el plan está en Balance.";
  }

  if (error instanceof AppError) {
    return "No se pudieron borrar los pagos. Inténtalo de nuevo.";
  }

  return null;
}

export async function wipePlanPaymentsAction(
  input: TWipePlanPaymentsFormData,
): Promise<TWipePlanPaymentsActionState> {
  const user = await requireAppUser();
  const parsed = wipePlanPaymentsSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await wipePlanPaymentsAndMoveToActive({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    const mapped = mapWipePlanPaymentsError(error);

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

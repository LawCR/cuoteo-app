"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TMovePlanToActiveActionState } from "@/features/plans/interfaces/plan.interface";
import {
  movePlanToActiveSchema,
  type TMovePlanToActiveFormData,
} from "@/features/plans/schemas/move-plan-to-active.schema";
import { movePlanToActive } from "@/features/plans/services/server/plan-service.server";

export async function movePlanToActiveAction(
  input: TMovePlanToActiveFormData,
): Promise<TMovePlanToActiveActionState> {
  const user = await requireAppUser();
  const parsed = movePlanToActiveSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await movePlanToActive({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ValidationError) {
      if (error.message === "has_payments") {
        return {
          error:
            "No puedes volver a Activo mientras haya pagos registrados.",
          success: false,
        };
      }

      return {
        error: "Solo puedes volver a Activo cuando el plan está en Balance.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo volver a Activo. Inténtalo de nuevo.",
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

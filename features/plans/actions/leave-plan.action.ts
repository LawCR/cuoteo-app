"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TLeavePlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  leavePlanSchema,
  type TLeavePlanFormData,
} from "@/features/plans/schemas/leave-plan.schema";
import { leavePlan } from "@/features/plans/services/server/plan-service.server";

export async function leavePlanAction(
  input: TLeavePlanFormData,
): Promise<TLeavePlanActionState> {
  const user = await requireAppUser();
  const parsed = leavePlanSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await leavePlan({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ValidationError) {
      if (error.message === "creator_cannot_leave") {
        return {
          error: "El creador no puede salir del plan.",
          success: false,
        };
      }

      return {
        error: "Solo puedes salir cuando el plan está activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo salir del plan. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/planes");
  revalidatePath(`/planes/${parsed.data.planId}`);
  revalidatePath("/dashboard");
  redirect("/planes");
}

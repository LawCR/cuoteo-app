"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import type { TDeletePlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  deletePlanSchema,
  type TDeletePlanFormData,
} from "@/features/plans/schemas/delete-plan.schema";
import { deletePlan } from "@/features/plans/services/server/plan-service.server";

export async function deletePlanAction(
  input: TDeletePlanFormData,
): Promise<TDeletePlanActionState> {
  const user = await requireAppUser();
  const parsed = deletePlanSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos ese plan.", success: false };
  }

  try {
    await deletePlan({
      actorUserId: user.id,
      planId: parsed.data.planId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof UnauthorizedError) {
      return {
        error: "Solo el creador puede eliminar el plan.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo eliminar el plan. Inténtalo de nuevo.",
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

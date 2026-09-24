"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TUpdatePlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  updatePlanMetadataSchema,
  type TUpdatePlanMetadataFormData,
} from "@/features/plans/schemas/plan-metadata.schema";
import { updatePlanMetadata } from "@/features/plans/services/server/plan-service.server";

export async function updatePlanAction(
  input: TUpdatePlanMetadataFormData,
): Promise<TUpdatePlanActionState> {
  const user = await requireAppUser();
  const parsed = updatePlanMetadataSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Revisa el nombre y el ícono del plan.",
      success: false,
    };
  }

  try {
    await updatePlanMetadata({
      actorUserId: user.id,
      planId: parsed.data.planId,
      name: parsed.data.name,
      icon: parsed.data.icon,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ValidationError) {
      return {
        error: "Solo se puede editar el nombre y el ícono en fase Activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo guardar el plan. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/planes");
  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

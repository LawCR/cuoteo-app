"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TAddGhostToPlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  addGhostToPlanSchema,
  type TAddGhostToPlanFormData,
} from "@/features/plans/schemas/add-ghost-to-plan.schema";
import { addGhostToPlan } from "@/features/plans/services/server/plan-service.server";

export async function addGhostToPlanAction(
  input: TAddGhostToPlanFormData,
): Promise<TAddGhostToPlanActionState> {
  const user = await requireAppUser();
  const parsed = addGhostToPlanSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Escribe el nombre del invitado.", success: false };
  }

  try {
    await addGhostToPlan({
      actorUserId: user.id,
      planId: parsed.data.planId,
      ghostName: parsed.data.ghostName,
      includeInPastExpenses: parsed.data.includeInPastExpenses,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ConflictError) {
      return {
        error: "Ya hay un invitado con ese nombre en este plan.",
        success: false,
      };
    }

    if (error instanceof ValidationError) {
      return {
        error: "Los invitados se pueden agregar solo cuando el plan está activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo agregar al invitado. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/planes");
  revalidatePath(`/planes/${parsed.data.planId}`);
  return { error: null, success: true };
}

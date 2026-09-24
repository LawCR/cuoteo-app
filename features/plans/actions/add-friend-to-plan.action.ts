"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TAddFriendToPlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  addFriendToPlanSchema,
  type TAddFriendToPlanFormData,
} from "@/features/plans/schemas/add-friend-to-plan.schema";
import { addFriendToPlan } from "@/features/plans/services/server/plan-service.server";

export async function addFriendToPlanAction(
  input: TAddFriendToPlanFormData,
): Promise<TAddFriendToPlanActionState> {
  const user = await requireAppUser();
  const parsed = addFriendToPlanSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Elige un amigo para agregar al plan.", success: false };
  }

  try {
    await addFriendToPlan({
      actorUserId: user.id,
      planId: parsed.data.planId,
      friendUserId: parsed.data.friendUserId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos ese plan.", success: false };
    }

    if (error instanceof ConflictError) {
      return { error: "Esa persona ya está en el plan.", success: false };
    }

    if (error instanceof ValidationError) {
      if (error.message === "plan_not_active") {
        return {
          error: "Solo se pueden agregar amigos en fase Activo.",
          success: false,
        };
      }

      if (error.message === "cannot_add_self") {
        return { error: "Ya formas parte de este plan.", success: false };
      }

      return {
        error: "Solo puedes agregar amigos al plan.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo agregar al plan. Inténtalo de nuevo.",
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

"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TRemovePlanMemberActionState } from "@/features/plans/interfaces/plan.interface";
import {
  removePlanMemberSchema,
  type TRemovePlanMemberFormData,
} from "@/features/plans/schemas/remove-plan-member.schema";
import { removePlanMember } from "@/features/plans/services/server/plan-service.server";

export async function removePlanMemberAction(
  input: TRemovePlanMemberFormData,
): Promise<TRemovePlanMemberActionState> {
  const user = await requireAppUser();
  const parsed = removePlanMemberSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "No encontramos a ese integrante.", success: false };
  }

  try {
    await removePlanMember({
      actorUserId: user.id,
      planId: parsed.data.planId,
      memberId: parsed.data.memberId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "No encontramos a ese integrante.", success: false };
    }

    if (error instanceof UnauthorizedError) {
      return {
        error: "Solo el creador puede quitar a integrantes con cuenta.",
        success: false,
      };
    }

    if (error instanceof ValidationError) {
      if (error.message === "cannot_remove_creator") {
        return {
          error: "El creador no se puede quitar del plan.",
          success: false,
        };
      }

      return {
        error: "Los integrantes se pueden quitar solo cuando el plan está activo.",
        success: false,
      };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo quitar al integrante. Inténtalo de nuevo.",
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

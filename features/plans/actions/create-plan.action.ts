"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import type { TCreatePlanActionState } from "@/features/plans/interfaces/plan.interface";
import {
  planMetadataSchema,
  type TPlanMetadataFormData,
} from "@/features/plans/schemas/plan-metadata.schema";
import { createPlan } from "@/features/plans/services/server/plan-service.server";

export async function createPlanAction(
  input: TPlanMetadataFormData,
): Promise<TCreatePlanActionState> {
  const user = await requireAppUser();
  const parsed = planMetadataSchema.safeParse(input);

  if (!parsed.success) {
    return { error: "Revisa el nombre y el ícono del plan." };
  }

  let planId: string;

  try {
    const plan = await createPlan({
      creatorUserId: user.id,
      name: parsed.data.name,
      icon: parsed.data.icon,
    });
    planId = plan.id;
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return { error: "No se pudo crear el plan. Inténtalo de nuevo." };
    }

    throw error;
  }

  revalidatePath("/planes");
  redirect(`/planes/${planId}`);
}

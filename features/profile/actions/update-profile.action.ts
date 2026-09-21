"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { ValidationError } from "@/core/errors/validation.error";
import { NO_BANK_SELECT_VALUE } from "@/features/profile/constants/profile.constants";
import type { TUpdateProfileActionState } from "@/features/profile/interfaces/update-profile.interface";
import {
  updateProfileSchema,
  type TUpdateProfileFormData,
} from "@/features/profile/schemas/update-profile.schema";
import { updateProfile } from "@/features/profile/services/server/user-service.server";
import {
  emptyToNull,
  resolveBankName,
  toPeruE164,
} from "@/features/profile/utils/profile.utils";

function conflictMessage(field: unknown): string {
  if (field === "phone") {
    return "Ese teléfono ya está registrado.";
  }

  return "Ya existe un perfil con esos datos.";
}

export async function updateProfileAction(
  input: TUpdateProfileFormData,
): Promise<TUpdateProfileActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Debes iniciar sesión para editar tu perfil.", success: false };
  }

  const parsed = updateProfileSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error:
        "Revisa nombre, teléfono y datos de cobro. Si eliges Otro, indica el banco.",
      success: false,
    };
  }

  try {
    await updateProfile({
      clerkUserId: userId,
      name: parsed.data.name,
      phone: toPeruE164(parsed.data.phone),
      bankName: resolveBankName(
        parsed.data.bankSelect,
        parsed.data.customBankName ?? "",
      ),
      cci:
        parsed.data.bankSelect === NO_BANK_SELECT_VALUE
          ? null
          : emptyToNull(parsed.data.cci),
      accountNumber:
        parsed.data.bankSelect === NO_BANK_SELECT_VALUE
          ? null
          : emptyToNull(parsed.data.accountNumber),
    });
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      return { error: conflictMessage(error.meta?.field), success: false };
    }

    if (error instanceof ValidationError) {
      return { error: "Los datos del perfil no son válidos.", success: false };
    }

    if (error instanceof AppError) {
      return { error: "No se pudo guardar el perfil. Inténtalo de nuevo.", success: false };
    }

    throw error;
  }

  revalidatePath("/perfil");
  return { error: null, success: true };
}

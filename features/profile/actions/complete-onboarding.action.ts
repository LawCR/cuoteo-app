"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TCompleteOnboardingActionState } from "@/features/profile/interfaces/complete-onboarding.interface";
import { completeOnboardingSchema } from "@/features/profile/schemas/complete-onboarding.schema";
import { completeOnboarding } from "@/features/profile/services/server/user-service.server";
import { toPeruE164 } from "@/features/profile/utils/profile.utils";

function conflictMessage(field: unknown): string {
  if (field === "username") {
    return "Ese nombre de usuario ya está en uso.";
  }

  if (field === "phone") {
    return "Ese teléfono ya está registrado.";
  }

  if (field === "email") {
    return "Este correo ya tiene un perfil en Cuoteo.";
  }

  return "Ya existe un perfil con esos datos.";
}

export async function completeOnboardingAction(
  _prevState: TCompleteOnboardingActionState,
  formData: FormData,
): Promise<TCompleteOnboardingActionState> {
  const { userId } = await auth();

  if (!userId) {
    return { error: "Debes iniciar sesión para completar tu perfil." };
  }

  const clerkUser = await currentUser();
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return { error: "No encontramos el correo de tu cuenta. Vuelve a iniciar sesión." };
  }

  const parsed = completeOnboardingSchema.safeParse({
    name: formData.get("name"),
    username: formData.get("username"),
    phone: formData.get("phone"),
  });

  if (!parsed.success) {
    return {
      error: "Revisa nombre, usuario y teléfono (9 dígitos, Perú).",
    };
  }

  try {
    await completeOnboarding({
      clerkUserId: userId,
      email,
      name: parsed.data.name,
      username: parsed.data.username,
      phone: toPeruE164(parsed.data.phone),
    });
  } catch (error: unknown) {
    if (error instanceof ConflictError) {
      return { error: conflictMessage(error.meta?.field) };
    }

    if (error instanceof ValidationError) {
      return { error: "Los datos del perfil no son válidos." };
    }

    if (error instanceof AppError) {
      return { error: "No se pudo completar el perfil. Inténtalo de nuevo." };
    }

    throw error;
  }

  redirect("/dashboard");
}

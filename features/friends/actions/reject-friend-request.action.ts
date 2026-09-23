"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TRespondFriendRequestActionState } from "@/features/friends/interfaces/friend-request-inbox.interface";
import { friendRequestIdSchema } from "@/features/friends/schemas/friend-request-id.schema";
import { rejectFriendRequest } from "@/features/friends/services/server/friend-request-service.server";

function mapRespondError(error: unknown): TRespondFriendRequestActionState | null {
  if (error instanceof NotFoundError) {
    return { error: "No encontramos esa solicitud.", success: false };
  }

  if (error instanceof UnauthorizedError) {
    return { error: "No puedes responder esta solicitud.", success: false };
  }

  if (error instanceof ValidationError) {
    return { error: "Esa solicitud ya no está pendiente.", success: false };
  }

  if (error instanceof ConflictError) {
    return { error: "No se pudo rechazar la solicitud.", success: false };
  }

  if (error instanceof AppError) {
    return {
      error: "No se pudo actualizar la solicitud. Inténtalo de nuevo.",
      success: false,
    };
  }

  return null;
}

export async function rejectFriendRequestAction(
  friendRequestId: string,
): Promise<TRespondFriendRequestActionState> {
  const user = await requireAppUser();
  const parsed = friendRequestIdSchema.safeParse({ friendRequestId });

  if (!parsed.success) {
    return { error: "La solicitud no es válida.", success: false };
  }

  try {
    await rejectFriendRequest({
      actorUserId: user.id,
      friendRequestId: parsed.data.friendRequestId,
    });
  } catch (error: unknown) {
    const mapped = mapRespondError(error);

    if (mapped) {
      return mapped;
    }

    throw error;
  }

  revalidatePath("/amigos");
  revalidatePath("/amigos/solicitudes");
  return { error: null, success: true };
}

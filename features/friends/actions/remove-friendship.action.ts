"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { TRemoveFriendshipActionState } from "@/features/friends/interfaces/friendship.interface";
import { friendUserIdSchema } from "@/features/friends/schemas/friend-user-id.schema";
import { removeFriendship } from "@/features/friends/services/server/friendship-service.server";

export async function removeFriendshipAction(
  friendUserId: string,
): Promise<TRemoveFriendshipActionState> {
  const user = await requireAppUser();
  const parsed = friendUserIdSchema.safeParse({ friendUserId });

  if (!parsed.success) {
    return { error: "Ese amigo no es válido.", success: false };
  }

  try {
    await removeFriendship({
      actorUserId: user.id,
      friendUserId: parsed.data.friendUserId,
    });
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: "Ya no son amigos.", success: false };
    }

    if (error instanceof ValidationError) {
      return { error: "No puedes eliminarte a ti mismo.", success: false };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo eliminar la amistad. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/amigos");
  return { error: null, success: true };
}

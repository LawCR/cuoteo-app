"use server";

import { revalidatePath } from "next/cache";
import { requireAppUser } from "@/core/auth/app-user.utils";
import { AppError } from "@/core/errors/app-error";
import { ConflictError } from "@/core/errors/conflict.error";
import { ExternalServiceError } from "@/core/errors/external-service.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  ISendFriendRequestResult,
  TSendFriendRequestActionState,
} from "@/features/friends/interfaces/send-friend-request.interface";
import { friendUserIdSchema } from "@/features/friends/schemas/friend-user-id.schema";
import {
  sendFriendRequestSchema,
  type TSendFriendRequestFormData,
} from "@/features/friends/schemas/send-friend-request.schema";
import { sendFriendRequestReceivedEmail } from "@/features/friends/services/server/friend-request-email-service.server";
import {
  sendFriendRequest,
  sendFriendRequestByUserId,
} from "@/features/friends/services/server/friend-request-service.server";
import type { User } from "@/generated/prisma/client";

function conflictMessage(reason: string): string {
  if (reason === "already_friends") {
    return "Ya son amigos.";
  }

  if (reason === "pending_request") {
    return "Ya hay una solicitud pendiente con esa persona.";
  }

  return "No se pudo enviar la solicitud.";
}

async function completeSendFriendRequest(
  fromUser: User,
  send: () => Promise<ISendFriendRequestResult>,
  notFoundMessage: string,
): Promise<TSendFriendRequestActionState> {
  try {
    const result = await send();

    try {
      await sendFriendRequestReceivedEmail({
        toEmail: result.toEmail,
        fromName: fromUser.name,
        fromUsername: fromUser.username,
      });
    } catch (error: unknown) {
      if (error instanceof ExternalServiceError) {
        console.error(error);
      } else {
        throw error;
      }
    }
  } catch (error: unknown) {
    if (error instanceof NotFoundError) {
      return { error: notFoundMessage, success: false };
    }

    if (error instanceof ValidationError) {
      return {
        error: "No puedes enviarte una solicitud a ti mismo.",
        success: false,
      };
    }

    if (error instanceof ConflictError) {
      return { error: conflictMessage(error.message), success: false };
    }

    if (error instanceof AppError) {
      return {
        error: "No se pudo enviar la solicitud. Inténtalo de nuevo.",
        success: false,
      };
    }

    throw error;
  }

  revalidatePath("/amigos");
  revalidatePath("/amigos/solicitudes");
  revalidatePath("/planes", "layout");
  return { error: null, success: true };
}

export async function sendFriendRequestAction(
  input: TSendFriendRequestFormData,
): Promise<TSendFriendRequestActionState> {
  const fromUser = await requireAppUser();
  const parsed = sendFriendRequestSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Escribe un usuario o correo exacto.",
      success: false,
    };
  }

  return completeSendFriendRequest(
    fromUser,
    () =>
      sendFriendRequest({
        fromUserId: fromUser.id,
        query: parsed.data.query,
      }),
    "No encontramos a nadie con ese usuario o correo.",
  );
}

export async function sendFriendRequestToUserAction(
  friendUserId: string,
): Promise<TSendFriendRequestActionState> {
  const fromUser = await requireAppUser();
  const parsed = friendUserIdSchema.safeParse({ friendUserId });

  if (!parsed.success) {
    return { error: "No encontramos a esa persona.", success: false };
  }

  return completeSendFriendRequest(
    fromUser,
    () =>
      sendFriendRequestByUserId({
        fromUserId: fromUser.id,
        toUserId: parsed.data.friendUserId,
      }),
    "No encontramos a esa persona.",
  );
}

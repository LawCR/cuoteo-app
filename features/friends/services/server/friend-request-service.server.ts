import { prisma } from "@/core/db";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type { ISendFriendRequestInput } from "@/features/friends/interfaces/send-friend-request.interface";
import {
  isEmailLookup,
  normalizeUsernameLookup,
  orderedUserPair,
} from "@/features/friends/utils/friendship.utils";
import {
  FriendRequestStatus,
  Prisma,
  type FriendRequest,
  type User,
} from "@/generated/prisma/client";

async function findUserByLookup(query: string): Promise<User | null> {
  if (isEmailLookup(query)) {
    return prisma.user.findFirst({
      where: {
        email: { equals: query.trim(), mode: "insensitive" },
      },
    });
  }

  return prisma.user.findUnique({
    where: { usernameNormalized: normalizeUsernameLookup(query) },
  });
}

export async function sendFriendRequest(
  input: ISendFriendRequestInput,
): Promise<FriendRequest> {
  const toUser = await findUserByLookup(input.query);

  if (!toUser) {
    throw new NotFoundError("user_not_found", { field: "query" });
  }

  if (toUser.id === input.fromUserId) {
    throw new ValidationError("cannot_friend_self", { field: "query" });
  }

  const { userLowId, userHighId } = orderedUserPair(input.fromUserId, toUser.id);

  const friendship = await prisma.friendship.findUnique({
    where: { userLowId_userHighId: { userLowId, userHighId } },
  });

  if (friendship) {
    throw new ConflictError("already_friends", { field: "query" });
  }

  const pending = await prisma.friendRequest.findFirst({
    where: {
      status: FriendRequestStatus.PENDING,
      OR: [
        { fromUserId: input.fromUserId, toUserId: toUser.id },
        { fromUserId: toUser.id, toUserId: input.fromUserId },
      ],
    },
  });

  if (pending) {
    throw new ConflictError("pending_request", { field: "query" });
  }

  const existing = await prisma.friendRequest.findUnique({
    where: {
      fromUserId_toUserId: {
        fromUserId: input.fromUserId,
        toUserId: toUser.id,
      },
    },
  });

  try {
    if (existing) {
      return await prisma.friendRequest.update({
        where: { id: existing.id },
        data: { status: FriendRequestStatus.PENDING },
      });
    }

    return await prisma.friendRequest.create({
      data: {
        fromUserId: input.fromUserId,
        toUserId: toUser.id,
        status: FriendRequestStatus.PENDING,
      },
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("pending_request", { field: "query" });
    }

    throw error;
  }
}

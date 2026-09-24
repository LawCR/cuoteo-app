import { prisma } from "@/core/db";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  ISendFriendRequestInput,
  ISendFriendRequestResult,
} from "@/features/friends/interfaces/send-friend-request.interface";
import type {
  IFriendRequestInbox,
  IFriendRequestListItem,
  IRespondFriendRequestInput,
} from "@/features/friends/interfaces/friend-request-inbox.interface";
import {
  isEmailLookup,
  normalizeUsernameLookup,
} from "@/features/friends/utils/friendship.utils";
import { orderedUserPair } from "@/shared/utils/friendship.utils";
import {
  FriendRequestStatus,
  Prisma,
  type FriendRequest,
  type Friendship,
  type User,
} from "@/generated/prisma/client";

const PEER_SELECT = {
  name: true,
  username: true,
  email: true,
} as const;

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
): Promise<ISendFriendRequestResult> {
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
    const request = existing
      ? await prisma.friendRequest.update({
          where: { id: existing.id },
          data: { status: FriendRequestStatus.PENDING },
        })
      : await prisma.friendRequest.create({
          data: {
            fromUserId: input.fromUserId,
            toUserId: toUser.id,
            status: FriendRequestStatus.PENDING,
          },
        });

    return { request, toEmail: toUser.email };
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

function toListItem(
  request: FriendRequest & {
    fromUser: IFriendRequestListItem["peer"];
    toUser: IFriendRequestListItem["peer"];
  },
  peerKey: "fromUser" | "toUser",
): IFriendRequestListItem {
  return {
    id: request.id,
    createdAt: request.createdAt,
    status: request.status,
    peer: request[peerKey],
  };
}

export async function listFriendRequests(
  userId: string,
): Promise<IFriendRequestInbox> {
  const [receivedRows, sentRows] = await Promise.all([
    prisma.friendRequest.findMany({
      where: {
        toUserId: userId,
        status: FriendRequestStatus.PENDING,
      },
      include: {
        fromUser: { select: PEER_SELECT },
        toUser: { select: PEER_SELECT },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.friendRequest.findMany({
      where: {
        fromUserId: userId,
        status: {
          in: [FriendRequestStatus.PENDING, FriendRequestStatus.REJECTED],
        },
      },
      include: {
        fromUser: { select: PEER_SELECT },
        toUser: { select: PEER_SELECT },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    received: receivedRows.map((row) => toListItem(row, "fromUser")),
    sent: sentRows.map((row) => toListItem(row, "toUser")),
  };
}

export async function acceptFriendRequest(
  input: IRespondFriendRequestInput,
): Promise<Friendship> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: input.friendRequestId },
  });

  if (!request) {
    throw new NotFoundError("friend_request_not_found", {
      field: "friendRequestId",
    });
  }

  if (request.toUserId !== input.actorUserId) {
    throw new UnauthorizedError("not_request_recipient", {
      field: "friendRequestId",
    });
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new ValidationError("request_not_pending", {
      field: "friendRequestId",
    });
  }

  const { userLowId, userHighId } = orderedUserPair(
    request.fromUserId,
    request.toUserId,
  );

  try {
    return await prisma.$transaction(async (tx) => {
      const existingFriendship = await tx.friendship.findUnique({
        where: { userLowId_userHighId: { userLowId, userHighId } },
      });

      const friendship =
        existingFriendship ??
        (await tx.friendship.create({
          data: { userLowId, userHighId },
        }));

      await tx.friendRequest.deleteMany({
        where: {
          OR: [
            {
              fromUserId: request.fromUserId,
              toUserId: request.toUserId,
            },
            {
              fromUserId: request.toUserId,
              toUserId: request.fromUserId,
            },
          ],
        },
      });

      return friendship;
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("already_friends", { field: "friendRequestId" });
    }

    throw error;
  }
}

export async function rejectFriendRequest(
  input: IRespondFriendRequestInput,
): Promise<FriendRequest> {
  const request = await prisma.friendRequest.findUnique({
    where: { id: input.friendRequestId },
  });

  if (!request) {
    throw new NotFoundError("friend_request_not_found", {
      field: "friendRequestId",
    });
  }

  if (request.toUserId !== input.actorUserId) {
    throw new UnauthorizedError("not_request_recipient", {
      field: "friendRequestId",
    });
  }

  if (request.status !== FriendRequestStatus.PENDING) {
    throw new ValidationError("request_not_pending", {
      field: "friendRequestId",
    });
  }

  return prisma.friendRequest.update({
    where: { id: request.id },
    data: { status: FriendRequestStatus.REJECTED },
  });
}

import { prisma } from "@/core/db";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  IFriendListItem,
  IRemoveFriendshipInput,
} from "@/features/friends/interfaces/friendship.interface";
import { orderedUserPair } from "@/shared/utils/friendship.utils";

const FRIEND_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
} as const;

export async function listFriends(userId: string): Promise<IFriendListItem[]> {
  const rows = await prisma.friendship.findMany({
    where: {
      OR: [{ userLowId: userId }, { userHighId: userId }],
    },
    include: {
      userLow: { select: FRIEND_SELECT },
      userHigh: { select: FRIEND_SELECT },
    },
  });

  return rows
    .map((row) => {
      const friend = row.userLowId === userId ? row.userHigh : row.userLow;

      return {
        friendshipId: row.id,
        friend,
      };
    })
    .sort((a, b) =>
      a.friend.name.localeCompare(b.friend.name, "es-PE", {
        sensitivity: "base",
      }),
    );
}

export async function removeFriendship(
  input: IRemoveFriendshipInput,
): Promise<void> {
  if (input.actorUserId === input.friendUserId) {
    throw new ValidationError("cannot_unfriend_self", {
      field: "friendUserId",
    });
  }

  const { userLowId, userHighId } = orderedUserPair(
    input.actorUserId,
    input.friendUserId,
  );

  const friendship = await prisma.friendship.findUnique({
    where: { userLowId_userHighId: { userLowId, userHighId } },
  });

  if (!friendship) {
    throw new NotFoundError("friendship_not_found", { field: "friendUserId" });
  }

  await prisma.friendship.delete({
    where: { id: friendship.id },
  });
}

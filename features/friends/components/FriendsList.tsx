import type { ReactElement } from "react";
import { FriendUserCard } from "@/features/friends/components/FriendUserCard";
import { RemoveFriendshipButton } from "@/features/friends/components/RemoveFriendshipButton";
import type { IFriendListItem } from "@/features/friends/interfaces/friendship.interface";

interface IFriendsListProps {
  friends: IFriendListItem[];
}

export function FriendsList({ friends }: IFriendsListProps): ReactElement {
  if (friends.length === 0) {
    return (
      <p className="text-muted-foreground">Todavía no hay amigos en tu lista.</p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {friends.map((item) => (
        <li key={item.friendshipId}>
          <FriendUserCard
            name={item.friend.name}
            username={item.friend.username}
            email={item.friend.email}
            actions={
              <RemoveFriendshipButton
                friendUserId={item.friend.id}
                friendName={item.friend.name}
              />
            }
            actionsPosition="bottom"
          />
        </li>
      ))}
    </ul>
  );
}

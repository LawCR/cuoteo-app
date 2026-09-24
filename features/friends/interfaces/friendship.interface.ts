export interface IFriendListItem {
  friendshipId: string;
  friend: {
    id: string;
    name: string;
    username: string;
    email: string;
  };
}

export interface IRemoveFriendshipInput {
  actorUserId: string;
  friendUserId: string;
}

export type TRemoveFriendshipActionState = {
  error: string | null;
  success: boolean;
};

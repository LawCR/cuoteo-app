import type { FriendRequestStatus } from "@/generated/prisma/client";

export interface IFriendRequestPeer {
  id: string;
  name: string;
  username: string;
  email: string;
}

export interface IFriendRequestListItem {
  id: string;
  createdAt: Date;
  status: FriendRequestStatus;
  peer: IFriendRequestPeer;
}

export interface IFriendRequestInbox {
  received: IFriendRequestListItem[];
  sent: IFriendRequestListItem[];
}

export interface IRespondFriendRequestInput {
  actorUserId: string;
  friendRequestId: string;
}

export type TRespondFriendRequestActionState = {
  error: string | null;
  success: boolean;
};

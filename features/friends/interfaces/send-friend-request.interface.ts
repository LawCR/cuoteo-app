import type { FriendRequest } from "@/generated/prisma/client";

export interface ISendFriendRequestInput {
  fromUserId: string;
  query: string;
}

export interface ISendFriendRequestByUserIdInput {
  fromUserId: string;
  toUserId: string;
}

export interface ISendFriendRequestResult {
  request: FriendRequest;
  toEmail: string;
}

export type TSendFriendRequestActionState = {
  error: string | null;
  success: boolean;
};

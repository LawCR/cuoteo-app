export interface ISendFriendRequestInput {
  fromUserId: string;
  query: string;
}

export type TSendFriendRequestActionState = {
  error: string | null;
  success: boolean;
};

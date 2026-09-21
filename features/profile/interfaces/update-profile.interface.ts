export interface IUpdateProfileInput {
  clerkUserId: string;
  name: string;
  phone: string;
  bankName: string | null;
  cci: string | null;
  accountNumber: string | null;
}

export type TUpdateProfileActionState = {
  error: string | null;
  success: boolean;
};
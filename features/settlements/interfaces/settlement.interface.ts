import type {
  IMemberRemainingBalance,
  ISuggestedTransfer,
} from "@/features/settlements/interfaces/remaining-balance.interface";

export interface ISettlementPayoutDetails {
  phone: string;
  bankName: string | null;
  cci: string | null;
  accountNumber: string | null;
}

export interface ISettlementMember extends IMemberRemainingBalance {
  name: string;
  isGhost: boolean;
  isSession: boolean;
  payout: ISettlementPayoutDetails | null;
}

export interface ISuggestedTransferView extends ISuggestedTransfer {
  fromName: string;
  toName: string;
}

export interface IPlanSettlement {
  planId: string;
  sessionMemberId: string;
  canRecordPayments: boolean;
  members: ISettlementMember[];
  transfers: ISuggestedTransferView[];
}

export interface IRecordPaymentInput {
  actorUserId: string;
  planId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export type TRecordPaymentActionState = {
  error: string | null;
  success: boolean;
};

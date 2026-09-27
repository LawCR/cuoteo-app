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

export type TPaymentKind = "TRANSFER" | "MANUAL_CLOSE";

export interface IRecordedPaymentView {
  id: string;
  fromName: string;
  toName: string;
  amount: number;
  createdAt: Date;
  kind: TPaymentKind;
}

export interface IPlanSettlement {
  planId: string;
  sessionMemberId: string;
  canRecordPayments: boolean;
  showCompletePayments: boolean;
  canCompletePayments: boolean;
  highlightCompletePayments: boolean;
  showCompletePlan: boolean;
  canCompletePlan: boolean;
  showSuggestedTransfers: boolean;
  members: ISettlementMember[];
  transfers: ISuggestedTransferView[];
  payments: IRecordedPaymentView[];
}

export interface IRecordPaymentInput {
  actorUserId: string;
  planId: string;
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface IVoidPaymentInput {
  actorUserId: string;
  planId: string;
  paymentId: string;
}

export interface ICompletePaymentsInput {
  actorUserId: string;
  planId: string;
}

export interface ICompletePlanInput {
  actorUserId: string;
  planId: string;
}

export type TRecordPaymentActionState = {
  error: string | null;
  success: boolean;
};

export type TVoidPaymentActionState = {
  error: string | null;
  success: boolean;
};

export type TCompletePaymentsActionState = {
  error: string | null;
  success: boolean;
};

export type TCompletePlanActionState = {
  error: string | null;
  success: boolean;
};

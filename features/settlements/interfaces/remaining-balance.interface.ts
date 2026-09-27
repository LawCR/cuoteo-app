export type TMemberBalanceRole = "creditor" | "debtor" | "zero";

export interface IBalanceExpenseShareInput {
  memberId: string;
  shareAmount: number;
}

export interface IBalanceExpenseInput {
  paidByMemberId: string;
  amount: number;
  shares: readonly IBalanceExpenseShareInput[];
}

export interface IBalancePaymentInput {
  fromMemberId: string;
  toMemberId: string;
  amount: number;
}

export interface IMemberRemainingBalance {
  memberId: string;
  netExpense: number;
  remaining: number;
  role: TMemberBalanceRole;
}

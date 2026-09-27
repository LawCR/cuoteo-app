import type { ExpenseCategory } from "@/generated/prisma/enums";

export interface IExpenseMemberOption {
  id: string;
  name: string;
  subtitle: string;
}

export interface IExpenseShareItem {
  memberId: string;
  shareAmount: number;
}

export interface IMemberShareSlice {
  memberId: string;
  name: string;
  amount: number;
  chartIndex: number;
}

export interface IMemberShareBreakdown {
  total: number;
  incompleteCount: number;
  slices: IMemberShareSlice[];
}

export interface IExpenseListItem {
  id: string;
  planId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByMemberId: string;
  paidByName: string;
  createdAt: Date;
  shareMemberIds: string[];
  shares: IExpenseShareItem[];
}

export interface ICreateExpenseInput {
  actorUserId: string;
  planId: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidByMemberId: string;
  shareMemberIds: string[];
}

export interface IUpdateExpenseInput extends ICreateExpenseInput {
  expenseId: string;
}

export interface IDeleteExpenseInput {
  actorUserId: string;
  planId: string;
  expenseId: string;
}

export interface IIncludeMemberInPastExpensesInput {
  planId: string;
  memberId: string;
}

export interface IExcludeMemberFromPlanExpensesInput {
  planId: string;
  memberId: string;
}

export type TCreateExpenseActionState = {
  error: string | null;
  success: boolean;
};

export type TUpdateExpenseActionState = {
  error: string | null;
  success: boolean;
};

export type TDeleteExpenseActionState = {
  error: string | null;
  success: boolean;
};

import { MEMBER_CHART_TOKEN_COUNT } from "@/features/expenses/constants/expenses.constants";
import type {
  IExpenseListItem,
  IExpenseMemberOption,
  IMemberShareBreakdown,
} from "@/features/expenses/interfaces/expense.interface";

const PEN_CENTS = 100;

export function buildMemberShareBreakdown(
  members: readonly Pick<IExpenseMemberOption, "id" | "name">[],
  expenses: readonly Pick<IExpenseListItem, "shareMemberIds" | "shares">[],
): IMemberShareBreakdown {
  const consumedCents = new Map<string, number>(
    members.map((member) => [member.id, 0]),
  );
  let incompleteCount = 0;
  let totalCents = 0;

  for (const expense of expenses) {
    if (expense.shareMemberIds.length === 0) {
      incompleteCount += 1;
      continue;
    }

    for (const share of expense.shares) {
      if (!consumedCents.has(share.memberId)) {
        continue;
      }

      const shareCents = Math.round(share.shareAmount * PEN_CENTS);
      consumedCents.set(
        share.memberId,
        (consumedCents.get(share.memberId) ?? 0) + shareCents,
      );
      totalCents += shareCents;
    }
  }

  return {
    total: totalCents / PEN_CENTS,
    incompleteCount,
    slices: members.map((member, index) => ({
      memberId: member.id,
      name: member.name,
      amount: (consumedCents.get(member.id) ?? 0) / PEN_CENTS,
      chartIndex: index % MEMBER_CHART_TOKEN_COUNT,
    })),
  };
}

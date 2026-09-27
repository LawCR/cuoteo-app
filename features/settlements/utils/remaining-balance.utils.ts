import { ValidationError } from "@/core/errors/validation.error";
import type {
  IBalanceExpenseInput,
  IBalancePaymentInput,
  IMemberRemainingBalance,
  TMemberBalanceRole,
} from "@/features/settlements/interfaces/remaining-balance.interface";

const PEN_CENTS = 100;
const PEN_CENTS_EPSILON = 1e-6;

function toNonNegativePenCents(amount: number, field: string): number {
  if (!Number.isFinite(amount) || amount < 0) {
    throw new ValidationError("amount_not_non_negative", { field });
  }

  const scaled = amount * PEN_CENTS;
  const cents = Math.round(scaled);

  if (Math.abs(scaled - cents) > PEN_CENTS_EPSILON) {
    throw new ValidationError("amount_not_pen_cents", { field });
  }

  return cents;
}

function toPositivePenCents(amount: number, field: string): number {
  const cents = toNonNegativePenCents(amount, field);

  if (cents <= 0) {
    throw new ValidationError("amount_not_positive", { field });
  }

  return cents;
}

function centsToPen(cents: number): number {
  return cents / PEN_CENTS;
}

export function getMemberBalanceRole(remaining: number): TMemberBalanceRole {
  const remainingCents = Math.round(remaining * PEN_CENTS);

  if (remainingCents > 0) {
    return "creditor";
  }

  if (remainingCents < 0) {
    return "debtor";
  }

  return "zero";
}

export function computeRemainingBalances(
  memberIds: readonly string[],
  expenses: readonly IBalanceExpenseInput[],
  payments: readonly IBalancePaymentInput[],
): IMemberRemainingBalance[] {
  const uniqueMemberIds = new Set(memberIds);

  if (uniqueMemberIds.size !== memberIds.length) {
    throw new ValidationError("duplicate_member_id", { field: "memberIds" });
  }

  const paidCents = new Map<string, number>(
    memberIds.map((memberId) => [memberId, 0]),
  );
  const consumedCents = new Map<string, number>(
    memberIds.map((memberId) => [memberId, 0]),
  );
  const sentCents = new Map<string, number>(
    memberIds.map((memberId) => [memberId, 0]),
  );
  const receivedCents = new Map<string, number>(
    memberIds.map((memberId) => [memberId, 0]),
  );

  for (const expense of expenses) {
    if (expense.shares.length === 0) {
      continue;
    }

    const amountCents = toPositivePenCents(expense.amount, "amount");

    if (paidCents.has(expense.paidByMemberId)) {
      paidCents.set(
        expense.paidByMemberId,
        (paidCents.get(expense.paidByMemberId) ?? 0) + amountCents,
      );
    }

    for (const share of expense.shares) {
      if (!consumedCents.has(share.memberId)) {
        continue;
      }

      consumedCents.set(
        share.memberId,
        (consumedCents.get(share.memberId) ?? 0) +
          toNonNegativePenCents(share.shareAmount, "shareAmount"),
      );
    }
  }

  for (const payment of payments) {
    const amountCents = toPositivePenCents(payment.amount, "amount");

    if (sentCents.has(payment.fromMemberId)) {
      sentCents.set(
        payment.fromMemberId,
        (sentCents.get(payment.fromMemberId) ?? 0) + amountCents,
      );
    }

    if (receivedCents.has(payment.toMemberId)) {
      receivedCents.set(
        payment.toMemberId,
        (receivedCents.get(payment.toMemberId) ?? 0) + amountCents,
      );
    }
  }

  return memberIds.map((memberId) => {
    const netExpenseCents =
      (paidCents.get(memberId) ?? 0) - (consumedCents.get(memberId) ?? 0);
    const remainingCents =
      netExpenseCents +
      (sentCents.get(memberId) ?? 0) -
      (receivedCents.get(memberId) ?? 0);
    const remaining = centsToPen(remainingCents);

    return {
      memberId,
      netExpense: centsToPen(netExpenseCents),
      remaining,
      role: getMemberBalanceRole(remaining),
    };
  });
}

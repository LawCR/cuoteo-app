import { ValidationError } from "@/core/errors/validation.error";
import type {
  IMemberRemainingBalance,
  ISuggestedTransfer,
} from "@/features/settlements/interfaces/remaining-balance.interface";

const PEN_CENTS = 100;

type TOpenBalance = {
  memberId: string;
  remainingCents: number;
};

function compareMemberId(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function compareLargestDebt(left: TOpenBalance, right: TOpenBalance): number {
  if (left.remainingCents !== right.remainingCents) {
    return left.remainingCents - right.remainingCents;
  }

  return compareMemberId(left.memberId, right.memberId);
}

function compareLargestCredit(left: TOpenBalance, right: TOpenBalance): number {
  if (left.remainingCents !== right.remainingCents) {
    return right.remainingCents - left.remainingCents;
  }

  return compareMemberId(left.memberId, right.memberId);
}

export function computeMinTransfers(
  balances: readonly Pick<IMemberRemainingBalance, "memberId" | "remaining">[],
): ISuggestedTransfer[] {
  const uniqueMemberIds = new Set(balances.map((row) => row.memberId));

  if (uniqueMemberIds.size !== balances.length) {
    throw new ValidationError("duplicate_member_id", { field: "memberIds" });
  }

  const open: TOpenBalance[] = balances
    .map((row) => ({
      memberId: row.memberId,
      remainingCents: Math.round(row.remaining * PEN_CENTS),
    }))
    .filter((row) => row.remainingCents !== 0);

  const transfers: ISuggestedTransfer[] = [];

  while (true) {
    const debtors = open
      .filter((row) => row.remainingCents < 0)
      .sort(compareLargestDebt);
    const creditors = open
      .filter((row) => row.remainingCents > 0)
      .sort(compareLargestCredit);

    if (debtors.length === 0 || creditors.length === 0) {
      break;
    }

    const debtor = debtors[0];
    const creditor = creditors[0];
    const amountCents = Math.min(-debtor.remainingCents, creditor.remainingCents);

    transfers.push({
      fromMemberId: debtor.memberId,
      toMemberId: creditor.memberId,
      amount: amountCents / PEN_CENTS,
    });

    debtor.remainingCents += amountCents;
    creditor.remainingCents -= amountCents;
  }

  return transfers;
}

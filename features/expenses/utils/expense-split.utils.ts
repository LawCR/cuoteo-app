import { ValidationError } from "@/core/errors/validation.error";
import type { IExpenseShareSplit } from "@/features/expenses/interfaces/expense-split.interface";

const PEN_CENTS = 100;
const PEN_CENTS_EPSILON = 1e-6;

function compareMemberId(left: string, right: string): number {
  if (left < right) {
    return -1;
  }

  if (left > right) {
    return 1;
  }

  return 0;
}

function toPenCents(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ValidationError("amount_not_positive", { field: "amount" });
  }

  const scaled = amount * PEN_CENTS;
  const cents = Math.round(scaled);

  if (Math.abs(scaled - cents) > PEN_CENTS_EPSILON) {
    throw new ValidationError("amount_not_pen_cents", { field: "amount" });
  }

  return cents;
}

export function splitEqualExpenseShares(
  amount: number,
  memberIds: readonly string[],
): IExpenseShareSplit[] {
  if (memberIds.length === 0) {
    throw new ValidationError("no_share_members", { field: "memberIds" });
  }

  const uniqueMemberIds = new Set(memberIds);

  if (uniqueMemberIds.size !== memberIds.length) {
    throw new ValidationError("duplicate_member_id", { field: "memberIds" });
  }

  const totalCents = toPenCents(amount);
  const participantCount = memberIds.length;
  const baseCents = Math.floor(totalCents / participantCount);
  const leftoverCents = totalCents % participantCount;

  const extraMemberIds = new Set(
    [...memberIds]
      .sort(compareMemberId)
      .slice(0, leftoverCents),
  );

  return memberIds.map((memberId) => {
    const shareCents =
      baseCents + (extraMemberIds.has(memberId) ? 1 : 0);

    return {
      memberId,
      shareAmount: shareCents / PEN_CENTS,
    };
  });
}

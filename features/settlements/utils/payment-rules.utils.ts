import { PlanPhase } from "@/generated/prisma/enums";
import { PEN_CENTS } from "@/features/settlements/constants/settlements.constants";

export type TRecordPaymentDenial = "plan_not_in_balance";

export function getRecordPaymentDenial(
  phase: PlanPhase,
): TRecordPaymentDenial | null {
  if (phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  return null;
}

export function getPaymentCap(
  fromRemaining: number,
  toRemaining: number,
): number {
  const fromCents = Math.round(fromRemaining * PEN_CENTS);
  const toCents = Math.round(toRemaining * PEN_CENTS);

  if (fromCents >= 0 || toCents <= 0) {
    return 0;
  }

  return Math.min(-fromCents, toCents) / PEN_CENTS;
}

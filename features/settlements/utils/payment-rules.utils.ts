import { PlanPhase } from "@/generated/prisma/enums";
import { PEN_CENTS } from "@/features/settlements/constants/settlements.constants";

export type TRecordPaymentDenial = "plan_not_in_balance";

export type TCompletePaymentsDenial =
  | "plan_not_in_balance"
  | "not_plan_creator";

export type TCompletePlanDenial =
  | "plan_not_in_balance"
  | "not_plan_creator"
  | "balances_not_settled";

export function getRecordPaymentDenial(
  phase: PlanPhase,
): TRecordPaymentDenial | null {
  if (phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  return null;
}

export function getCompletePaymentsDenial(
  phase: PlanPhase,
  actorUserId: string,
  creatorUserId: string,
): TCompletePaymentsDenial | null {
  if (phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  if (actorUserId !== creatorUserId) {
    return "not_plan_creator";
  }

  return null;
}

export function getCompletePlanDenial(
  phase: PlanPhase,
  actorUserId: string,
  creatorUserId: string,
  isSettled: boolean,
): TCompletePlanDenial | null {
  if (phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  if (actorUserId !== creatorUserId) {
    return "not_plan_creator";
  }

  if (!isSettled) {
    return "balances_not_settled";
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

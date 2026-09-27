import {
  MIN_EXPENSES_TO_ENTER_BALANCE,
  MIN_MEMBERS_TO_ENTER_BALANCE,
} from "@/features/plans/constants/plans.constants";
import { PlanPhase } from "@/generated/prisma/enums";

export type TMovePlanToBalanceDenial =
  | "plan_not_active"
  | "not_enough_members"
  | "not_enough_expenses"
  | "expenses_missing_share_members";

export type TMovePlanToActiveDenial =
  | "plan_not_in_balance"
  | "has_payments";

export type TWipePaymentsDenial =
  | "plan_not_in_balance"
  | "not_plan_creator"
  | "no_payments";

export function getMovePlanToBalanceDenial(input: {
  phase: PlanPhase;
  memberCount: number;
  expenseCount: number;
  hasExpensesWithoutShareMembers: boolean;
}): TMovePlanToBalanceDenial | null {
  if (input.phase !== PlanPhase.ACTIVE) {
    return "plan_not_active";
  }

  if (input.memberCount < MIN_MEMBERS_TO_ENTER_BALANCE) {
    return "not_enough_members";
  }

  if (input.expenseCount < MIN_EXPENSES_TO_ENTER_BALANCE) {
    return "not_enough_expenses";
  }

  if (input.hasExpensesWithoutShareMembers) {
    return "expenses_missing_share_members";
  }

  return null;
}

export function getMovePlanToActiveDenial(input: {
  phase: PlanPhase;
  paymentCount: number;
}): TMovePlanToActiveDenial | null {
  if (input.phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  if (input.paymentCount > 0) {
    return "has_payments";
  }

  return null;
}

export function getWipePaymentsDenial(input: {
  phase: PlanPhase;
  actorUserId: string;
  creatorUserId: string;
  paymentCount: number;
}): TWipePaymentsDenial | null {
  if (input.phase !== PlanPhase.BALANCE) {
    return "plan_not_in_balance";
  }

  if (input.actorUserId !== input.creatorUserId) {
    return "not_plan_creator";
  }

  if (input.paymentCount === 0) {
    return "no_payments";
  }

  return null;
}

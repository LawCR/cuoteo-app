import { MIN_MEMBERS_TO_CREATE_EXPENSE } from "@/features/expenses/constants/expenses.constants";
import { PlanPhase } from "@/generated/prisma/enums";

export type TCreateExpenseDenial = "plan_not_active" | "not_enough_members";

export type TMutateExpenseDenial = "plan_not_active";

export function getCreateExpenseDenial(input: {
  phase: PlanPhase;
  memberCount: number;
}): TCreateExpenseDenial | null {
  if (input.phase !== PlanPhase.ACTIVE) {
    return "plan_not_active";
  }

  if (input.memberCount < MIN_MEMBERS_TO_CREATE_EXPENSE) {
    return "not_enough_members";
  }

  return null;
}

export function getMutateExpenseDenial(phase: PlanPhase): TMutateExpenseDenial | null {
  if (phase !== PlanPhase.ACTIVE) {
    return "plan_not_active";
  }

  return null;
}

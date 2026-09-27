import { PlanPhase, type ExpenseCategory } from "@/generated/prisma/enums";
import { DEFAULT_EXPENSE_CATEGORY } from "@/shared/constants/expense-category.constants";

export const PLAN_NAME_MAX_LENGTH = 80;

export {
  EXPENSE_CATEGORY_CHART_CLASS,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_VALUES,
} from "@/shared/constants/expense-category.constants";

export const PLAN_PHASE_VALUES = [
  PlanPhase.ACTIVE,
  PlanPhase.BALANCE,
  PlanPhase.COMPLETED,
] as const;

export const PLAN_PHASE_LABELS: Record<PlanPhase, string> = {
  ACTIVE: "Activo",
  BALANCE: "Balance",
  COMPLETED: "Completado",
};

export const PLAN_LIST_PHASE_ALL = "ALL" as const;

export const DEFAULT_PLAN_ICON: ExpenseCategory = DEFAULT_EXPENSE_CATEGORY;

export const GHOST_NAME_MAX_LENGTH = 80;

export const MIN_MEMBERS_TO_ENTER_BALANCE = 2;

export const MIN_EXPENSES_TO_ENTER_BALANCE = 1;

export const LIVE_PLAN_PHASES: readonly PlanPhase[] = [
  PlanPhase.ACTIVE,
  PlanPhase.BALANCE,
];

import type { ExpenseCategory, PlanPhase } from "@/generated/prisma/enums";
import { DEFAULT_EXPENSE_CATEGORY } from "@/shared/constants/expense-category.constants";

export const PLAN_NAME_MAX_LENGTH = 80;

export {
  EXPENSE_CATEGORY_CHART_CLASS,
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_VALUES,
} from "@/shared/constants/expense-category.constants";

export const PLAN_PHASE_LABELS: Record<PlanPhase, string> = {
  ACTIVE: "Activo",
  BALANCE: "Balance",
  COMPLETED: "Completado",
};

export const DEFAULT_PLAN_ICON: ExpenseCategory = DEFAULT_EXPENSE_CATEGORY;

export const GHOST_NAME_MAX_LENGTH = 80;

export const MIN_MEMBERS_TO_ENTER_BALANCE = 2;

export const MIN_EXPENSES_TO_ENTER_BALANCE = 1;

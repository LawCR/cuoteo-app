import type { ExpenseCategory, PlanPhase } from "@/generated/prisma/enums";

export const PLAN_NAME_MAX_LENGTH = 80;

export const EXPENSE_CATEGORY_VALUES = [
  "FOOD",
  "TRANSPORT",
  "LODGING",
  "ENTERTAINMENT",
  "SHOPPING",
  "HEALTH",
  "SERVICES",
  "OTHER",
] as const satisfies ReadonlyArray<ExpenseCategory>;

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: "Comida",
  TRANSPORT: "Transporte",
  LODGING: "Alojamiento",
  ENTERTAINMENT: "Entretenimiento",
  SHOPPING: "Compras",
  HEALTH: "Salud",
  SERVICES: "Servicios",
  OTHER: "Otros",
};

export const EXPENSE_CATEGORY_CHART_CLASS: Record<ExpenseCategory, string> = {
  FOOD: "text-chart-1",
  TRANSPORT: "text-chart-2",
  LODGING: "text-chart-3",
  ENTERTAINMENT: "text-chart-4",
  SHOPPING: "text-chart-5",
  HEALTH: "text-chart-6",
  SERVICES: "text-chart-7",
  OTHER: "text-chart-8",
};

export const PLAN_PHASE_LABELS: Record<PlanPhase, string> = {
  ACTIVE: "Activo",
  BALANCE: "Balance",
  COMPLETED: "Completado",
};

export const DEFAULT_PLAN_ICON: ExpenseCategory = "FOOD";

export const GHOST_NAME_MAX_LENGTH = 80;

export const MIN_MEMBERS_TO_ENTER_BALANCE = 2;

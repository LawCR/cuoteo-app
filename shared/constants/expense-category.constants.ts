import type { ExpenseCategory } from "@/generated/prisma/enums";

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

export const DEFAULT_EXPENSE_CATEGORY: ExpenseCategory = "FOOD";

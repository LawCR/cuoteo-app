import type { ReactNode } from "react";
import type { ExpenseCategory, PlanPhase } from "@/generated/prisma/enums";

export interface IAppNavLivePlan {
  id: string;
  name: string;
  icon: ExpenseCategory;
  phase: PlanPhase;
}

export interface IAppNavProps {
  livePlans: readonly IAppNavLivePlan[];
  onNavigate?: () => void;
}

export interface IAppNavSubmenuProps {
  title: string;
  plans: readonly IAppNavLivePlan[];
  emptyLabel?: string;
  headerTrailing?: ReactNode;
  onNavigate?: () => void;
}

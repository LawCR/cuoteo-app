import type { ExpenseCategory, PlanPhase } from "@/generated/prisma/enums";

export interface IPlanSummary {
  id: string;
  name: string;
  icon: ExpenseCategory;
  phase: PlanPhase;
  creatorUserId: string;
  createdAt: Date;
}

export interface ICreatePlanInput {
  creatorUserId: string;
  name: string;
  icon: ExpenseCategory;
}

export interface IUpdatePlanMetadataInput {
  actorUserId: string;
  planId: string;
  name: string;
  icon: ExpenseCategory;
}

export type TCreatePlanActionState = {
  error: string | null;
};

export type TUpdatePlanActionState = {
  error: string | null;
  success: boolean;
};

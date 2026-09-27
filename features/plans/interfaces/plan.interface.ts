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

export interface IPlanMemberItem {
  id: string;
  userId: string | null;
  ghostName: string | null;
  user: {
    id: string;
    name: string;
    username: string;
    email: string;
  } | null;
}

export interface IPlanDetail extends IPlanSummary {
  members: IPlanMemberItem[];
  paymentCount: number;
}

export interface IUpdatePlanMetadataInput {
  actorUserId: string;
  planId: string;
  name: string;
  icon: ExpenseCategory;
}

export interface IAddFriendToPlanInput {
  actorUserId: string;
  planId: string;
  friendUserId: string;
  includeInPastExpenses: boolean;
}

export interface IAddGhostToPlanInput {
  actorUserId: string;
  planId: string;
  ghostName: string;
  includeInPastExpenses: boolean;
}

export interface ILeavePlanInput {
  actorUserId: string;
  planId: string;
}

export interface IRemovePlanMemberInput {
  actorUserId: string;
  planId: string;
  memberId: string;
}

export interface IMovePlanToBalanceInput {
  actorUserId: string;
  planId: string;
}

export interface IMovePlanToActiveInput {
  actorUserId: string;
  planId: string;
}

export interface IWipePlanPaymentsInput {
  actorUserId: string;
  planId: string;
}

export interface IDeletePlanInput {
  actorUserId: string;
  planId: string;
}

export interface IPlanFriendOption {
  id: string;
  name: string;
  username: string;
}

export type TCreatePlanActionState = {
  error: string | null;
};

export type TUpdatePlanActionState = {
  error: string | null;
  success: boolean;
};

export type TAddFriendToPlanActionState = {
  error: string | null;
  success: boolean;
};

export type TAddGhostToPlanActionState = {
  error: string | null;
  success: boolean;
};

export type TLeavePlanActionState = {
  error: string | null;
  success: boolean;
};

export type TRemovePlanMemberActionState = {
  error: string | null;
  success: boolean;
};

export type TMovePlanToBalanceActionState = {
  error: string | null;
  success: boolean;
};

export type TMovePlanToActiveActionState = {
  error: string | null;
  success: boolean;
};

export type TWipePlanPaymentsActionState = {
  error: string | null;
  success: boolean;
};

export type TDeletePlanActionState = {
  error: string | null;
  success: boolean;
};

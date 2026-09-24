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
}

export interface IAddGhostToPlanInput {
  actorUserId: string;
  planId: string;
  ghostName: string;
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

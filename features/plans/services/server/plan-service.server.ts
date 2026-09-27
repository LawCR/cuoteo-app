import { prisma } from "@/core/db";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import {
  countExpensesForPlan,
  excludeMemberFromPlanExpenses,
  includeMemberInPastExpenses,
  listExpenseTitlesWithoutShareMembers,
} from "@/features/expenses/services/server/expense-service.server";
import type {
  IAddFriendToPlanInput,
  IAddGhostToPlanInput,
  ICreatePlanInput,
  IDeletePlanInput,
  ILeavePlanInput,
  IMovePlanToActiveInput,
  IMovePlanToBalanceInput,
  IPlanDetail,
  IPlanMemberItem,
  IPlanSummary,
  IRemovePlanMemberInput,
  IUpdatePlanMetadataInput,
  IWipePlanPaymentsInput,
} from "@/features/plans/interfaces/plan.interface";
import { normalizeGhostName } from "@/features/plans/utils/ghost-name.utils";
import {
  getDeletePlanDenial,
  getLeavePlanDenial,
  getRemoveMemberDenial,
} from "@/features/plans/utils/plan-membership-rules.utils";
import {
  getMovePlanToActiveDenial,
  getMovePlanToBalanceDenial,
  getWipePaymentsDenial,
} from "@/features/plans/utils/plan-phase-rules.utils";
import {
  PlanPhase,
  Prisma,
  type Plan,
} from "@/generated/prisma/client";
import { orderedUserPair } from "@/shared/utils/friendship.utils";

const PLAN_MEMBER_USER_SELECT = {
  id: true,
  name: true,
  username: true,
  email: true,
} as const;

const PLAN_DETAIL_INCLUDE = {
  members: {
    include: {
      user: { select: PLAN_MEMBER_USER_SELECT },
    },
    orderBy: { createdAt: "asc" as const },
  },
};

type TPlanDetailRecord = Prisma.PlanGetPayload<{
  include: typeof PLAN_DETAIL_INCLUDE;
}>;

function toPlanSummary(plan: Plan): IPlanSummary {
  return {
    id: plan.id,
    name: plan.name,
    icon: plan.icon,
    phase: plan.phase,
    creatorUserId: plan.creatorUserId,
    createdAt: plan.createdAt,
  };
}

function toPlanMemberItem(
  member: TPlanDetailRecord["members"][number],
): IPlanMemberItem {
  return {
    id: member.id,
    userId: member.userId,
    ghostName: member.ghostName,
    user: member.user,
  };
}

function toPlanDetail(
  plan: TPlanDetailRecord,
  paymentCount: number,
): IPlanDetail {
  return {
    ...toPlanSummary(plan),
    members: plan.members.map(toPlanMemberItem),
    paymentCount,
  };
}

async function countPaymentsForPlan(planId: string): Promise<number> {
  return prisma.payment.count({ where: { planId } });
}

async function findAccessiblePlan(
  planId: string,
  userId: string,
): Promise<Plan> {
  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      members: { some: { userId } },
    },
  });

  if (!plan) {
    throw new NotFoundError("plan_not_found", { field: "planId" });
  }

  return plan;
}

async function findAccessiblePlanDetail(
  planId: string,
  userId: string,
): Promise<TPlanDetailRecord> {
  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      members: { some: { userId } },
    },
    include: PLAN_DETAIL_INCLUDE,
  });

  if (!plan) {
    throw new NotFoundError("plan_not_found", { field: "planId" });
  }

  return plan;
}

async function areFriends(
  userIdA: string,
  userIdB: string,
): Promise<boolean> {
  const { userLowId, userHighId } = orderedUserPair(userIdA, userIdB);
  const friendship = await prisma.friendship.findUnique({
    where: { userLowId_userHighId: { userLowId, userHighId } },
  });

  return friendship !== null;
}

function assertPlanIsActive(phase: Plan["phase"]): void {
  if (phase !== PlanPhase.ACTIVE) {
    throw new ValidationError("plan_not_active", { field: "planId" });
  }
}

async function createPlanMemberAndMaybeIncludePastExpenses(input: {
  planId: string;
  userId?: string;
  ghostName?: string;
  ghostNameNormalized?: string;
  includeInPastExpenses: boolean;
}): Promise<void> {
  const memberData = {
    planId: input.planId,
    ...(input.userId ? { userId: input.userId } : {}),
    ...(input.ghostName
      ? {
          ghostName: input.ghostName,
          ghostNameNormalized: input.ghostNameNormalized,
        }
      : {}),
  };

  if (!input.includeInPastExpenses) {
    await prisma.planMember.create({ data: memberData });
    return;
  }

  await prisma.$transaction(async (tx) => {
    const member = await tx.planMember.create({ data: memberData });
    await includeMemberInPastExpenses(tx, {
      planId: input.planId,
      memberId: member.id,
    });
  });
}

export async function listPlansForUser(
  userId: string,
): Promise<IPlanSummary[]> {
  const plans = await prisma.plan.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { createdAt: "desc" },
  });

  return plans.map(toPlanSummary);
}

export async function getPlanForUser(
  planId: string,
  userId: string,
): Promise<IPlanDetail> {
  const plan = await findAccessiblePlanDetail(planId, userId);
  const paymentCount = await countPaymentsForPlan(plan.id);
  return toPlanDetail(plan, paymentCount);
}

export async function createPlan(
  input: ICreatePlanInput,
): Promise<IPlanSummary> {
  const plan = await prisma.$transaction(async (tx) => {
    const created = await tx.plan.create({
      data: {
        name: input.name,
        icon: input.icon,
        creatorUserId: input.creatorUserId,
      },
    });

    await tx.planMember.create({
      data: {
        planId: created.id,
        userId: input.creatorUserId,
      },
    });

    return created;
  });

  return toPlanSummary(plan);
}

export async function updatePlanMetadata(
  input: IUpdatePlanMetadataInput,
): Promise<IPlanSummary> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  assertPlanIsActive(plan.phase);

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: {
      name: input.name,
      icon: input.icon,
    },
  });

  return toPlanSummary(updated);
}

export async function addFriendToPlan(
  input: IAddFriendToPlanInput,
): Promise<void> {
  if (input.actorUserId === input.friendUserId) {
    throw new ValidationError("cannot_add_self", { field: "friendUserId" });
  }

  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  assertPlanIsActive(plan.phase);

  const alreadyMember = await prisma.planMember.findUnique({
    where: {
      planId_userId: {
        planId: plan.id,
        userId: input.friendUserId,
      },
    },
  });

  if (alreadyMember) {
    throw new ConflictError("already_member", { field: "friendUserId" });
  }

  const isFriendOfActor = await areFriends(
    input.actorUserId,
    input.friendUserId,
  );
  const isFriendOfCreator = await areFriends(
    plan.creatorUserId,
    input.friendUserId,
  );

  if (!isFriendOfActor && !isFriendOfCreator) {
    throw new ValidationError("not_friends", { field: "friendUserId" });
  }

  await createPlanMemberAndMaybeIncludePastExpenses({
    planId: plan.id,
    userId: input.friendUserId,
    includeInPastExpenses: input.includeInPastExpenses,
  });
}

export async function addGhostToPlan(
  input: IAddGhostToPlanInput,
): Promise<void> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  assertPlanIsActive(plan.phase);

  const ghostName = input.ghostName.trim();
  const ghostNameNormalized = normalizeGhostName(ghostName);

  const existing = await prisma.planMember.findUnique({
    where: {
      planId_ghostNameNormalized: {
        planId: plan.id,
        ghostNameNormalized,
      },
    },
  });

  if (existing) {
    throw new ConflictError("ghost_name_taken", { field: "ghostName" });
  }

  try {
    await createPlanMemberAndMaybeIncludePastExpenses({
      planId: plan.id,
      ghostName,
      ghostNameNormalized,
      includeInPastExpenses: input.includeInPastExpenses,
    });
  } catch (error: unknown) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new ConflictError("ghost_name_taken", { field: "ghostName" });
    }

    throw error;
  }
}

export async function leavePlan(input: ILeavePlanInput): Promise<void> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  assertPlanIsActive(plan.phase);

  const denial = getLeavePlanDenial(input.actorUserId, plan.creatorUserId);

  if (denial === "creator_cannot_leave") {
    throw new ValidationError("creator_cannot_leave", { field: "planId" });
  }

  const membership = await prisma.planMember.findUnique({
    where: {
      planId_userId: {
        planId: plan.id,
        userId: input.actorUserId,
      },
    },
  });

  if (!membership) {
    throw new NotFoundError("plan_member_not_found", { field: "planId" });
  }

  await prisma.$transaction(async (tx) => {
    await excludeMemberFromPlanExpenses(tx, {
      planId: plan.id,
      memberId: membership.id,
    });
    await tx.planMember.delete({ where: { id: membership.id } });
  });
}

export async function removePlanMember(
  input: IRemovePlanMemberInput,
): Promise<void> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  assertPlanIsActive(plan.phase);

  const member = await prisma.planMember.findFirst({
    where: {
      id: input.memberId,
      planId: plan.id,
    },
  });

  if (!member) {
    throw new NotFoundError("plan_member_not_found", { field: "memberId" });
  }

  const denial = getRemoveMemberDenial({
    actorUserId: input.actorUserId,
    creatorUserId: plan.creatorUserId,
    targetUserId: member.userId,
  });

  if (denial === "cannot_remove_creator") {
    throw new ValidationError("cannot_remove_creator", { field: "memberId" });
  }

  if (denial === "cannot_remove_registered_member") {
    throw new UnauthorizedError("cannot_remove_registered_member", {
      field: "memberId",
    });
  }

  await prisma.$transaction(async (tx) => {
    await excludeMemberFromPlanExpenses(tx, {
      planId: plan.id,
      memberId: member.id,
    });
    await tx.planMember.delete({ where: { id: member.id } });
  });
}

export async function movePlanToBalance(
  input: IMovePlanToBalanceInput,
): Promise<IPlanSummary> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  const memberCount = await prisma.planMember.count({
    where: { planId: plan.id },
  });
  const [expenseCount, expensesWithoutShareMembers] = await Promise.all([
    countExpensesForPlan(plan.id),
    listExpenseTitlesWithoutShareMembers(plan.id),
  ]);
  const denial = getMovePlanToBalanceDenial({
    phase: plan.phase,
    memberCount,
    expenseCount,
    hasExpensesWithoutShareMembers: expensesWithoutShareMembers.length > 0,
  });

  if (denial === "plan_not_active") {
    throw new ValidationError("plan_not_active", { field: "planId" });
  }

  if (denial === "not_enough_members") {
    throw new ValidationError("not_enough_members", { field: "planId" });
  }

  if (denial === "not_enough_expenses") {
    throw new ValidationError("not_enough_expenses", { field: "planId" });
  }

  if (denial === "expenses_missing_share_members") {
    throw new ValidationError("expenses_missing_share_members", {
      field: "planId",
      expenseTitles: expensesWithoutShareMembers,
    });
  }

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: { phase: PlanPhase.BALANCE },
  });

  return toPlanSummary(updated);
}

export async function movePlanToActive(
  input: IMovePlanToActiveInput,
): Promise<IPlanSummary> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  const paymentCount = await countPaymentsForPlan(plan.id);
  const denial = getMovePlanToActiveDenial({
    phase: plan.phase,
    paymentCount,
  });

  if (denial === "plan_not_in_balance") {
    throw new ValidationError("plan_not_in_balance", { field: "planId" });
  }

  if (denial === "has_payments") {
    throw new ValidationError("has_payments", { field: "planId" });
  }

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: { phase: PlanPhase.ACTIVE },
  });

  return toPlanSummary(updated);
}

export async function wipePlanPaymentsAndMoveToActive(
  input: IWipePlanPaymentsInput,
): Promise<IPlanSummary> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  const paymentCount = await countPaymentsForPlan(plan.id);
  const denial = getWipePaymentsDenial({
    phase: plan.phase,
    actorUserId: input.actorUserId,
    creatorUserId: plan.creatorUserId,
    paymentCount,
  });

  if (denial === "not_plan_creator") {
    throw new UnauthorizedError("not_plan_creator", { field: "planId" });
  }

  if (denial === "plan_not_in_balance") {
    throw new ValidationError("plan_not_in_balance", { field: "planId" });
  }

  if (denial === "no_payments") {
    throw new ValidationError("no_payments", { field: "planId" });
  }

  const updated = await prisma.$transaction(async (tx) => {
    await tx.payment.deleteMany({ where: { planId: plan.id } });

    return tx.plan.update({
      where: { id: plan.id },
      data: { phase: PlanPhase.ACTIVE },
    });
  });

  return toPlanSummary(updated);
}

export async function deletePlan(input: IDeletePlanInput): Promise<void> {
  const plan = await findAccessiblePlan(input.planId, input.actorUserId);
  const denial = getDeletePlanDenial(input.actorUserId, plan.creatorUserId);

  if (denial === "not_plan_creator") {
    throw new UnauthorizedError("not_plan_creator", { field: "planId" });
  }

  await prisma.plan.delete({ where: { id: plan.id } });
}

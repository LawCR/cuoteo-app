import { prisma } from "@/core/db";
import { ConflictError } from "@/core/errors/conflict.error";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  IAddFriendToPlanInput,
  IAddGhostToPlanInput,
  ICreatePlanInput,
  IPlanDetail,
  IPlanMemberItem,
  IPlanSummary,
  IUpdatePlanMetadataInput,
} from "@/features/plans/interfaces/plan.interface";
import { normalizeGhostName } from "@/features/plans/utils/ghost-name.utils";
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

function toPlanDetail(plan: TPlanDetailRecord): IPlanDetail {
  return {
    ...toPlanSummary(plan),
    members: plan.members.map(toPlanMemberItem),
  };
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
  return toPlanDetail(plan);
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

  await prisma.planMember.create({
    data: {
      planId: plan.id,
      userId: input.friendUserId,
    },
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
    await prisma.planMember.create({
      data: {
        planId: plan.id,
        ghostName,
        ghostNameNormalized,
      },
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

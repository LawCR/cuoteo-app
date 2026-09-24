import { prisma } from "@/core/db";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  ICreatePlanInput,
  IPlanSummary,
  IUpdatePlanMetadataInput,
} from "@/features/plans/interfaces/plan.interface";
import { PlanPhase, type Plan } from "@/generated/prisma/client";

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
): Promise<IPlanSummary> {
  const plan = await findAccessiblePlan(planId, userId);
  return toPlanSummary(plan);
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

  if (plan.phase !== PlanPhase.ACTIVE) {
    throw new ValidationError("plan_not_active", { field: "planId" });
  }

  const updated = await prisma.plan.update({
    where: { id: plan.id },
    data: {
      name: input.name,
      icon: input.icon,
    },
  });

  return toPlanSummary(updated);
}

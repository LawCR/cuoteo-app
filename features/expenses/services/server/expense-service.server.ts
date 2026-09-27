import { prisma } from "@/core/db";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import type {
  ICreateExpenseInput,
  IDeleteExpenseInput,
  IExcludeMemberFromPlanExpensesInput,
  IExpenseListItem,
  IIncludeMemberInPastExpensesInput,
  IUpdateExpenseInput,
} from "@/features/expenses/interfaces/expense.interface";
import {
  memberIdsWithLateJoiner,
  memberIdsWithoutLeaver,
  recalculateEqualExpenseShares,
} from "@/features/expenses/utils/expense-split.utils";
import {
  getCreateExpenseDenial,
  getMutateExpenseDenial,
} from "@/features/expenses/utils/expense-rules.utils";
import { Prisma, type Plan, type PlanMember } from "@/generated/prisma/client";

const EXPENSE_LIST_INCLUDE = {
  paidByMember: {
    include: {
      user: {
        select: { name: true },
      },
    },
  },
  shares: {
    select: {
      memberId: true,
      shareAmount: true,
    },
  },
} as const;

type TExpenseListRecord = Prisma.ExpenseGetPayload<{
  include: typeof EXPENSE_LIST_INCLUDE;
}>;

type TPlanWithMembers = Plan & { members: PlanMember[] };

function toPenNumber(value: Prisma.Decimal): number {
  return Number(value);
}

function memberDisplayName(member: {
  ghostName: string | null;
  user: { name: string } | null;
}): string {
  if (member.user) {
    return member.user.name;
  }

  return member.ghostName ?? "Invitado";
}

function toExpenseListItem(expense: TExpenseListRecord): IExpenseListItem {
  return {
    id: expense.id,
    planId: expense.planId,
    title: expense.title,
    amount: toPenNumber(expense.amount),
    category: expense.category,
    paidByMemberId: expense.paidByMemberId,
    paidByName: memberDisplayName(expense.paidByMember),
    createdAt: expense.createdAt,
    shareMemberIds: expense.shares.map((share) => share.memberId),
    shares: expense.shares.map((share) => ({
      memberId: share.memberId,
      shareAmount: toPenNumber(share.shareAmount),
    })),
  };
}

async function findAccessiblePlanWithMembers(
  planId: string,
  actorUserId: string,
): Promise<TPlanWithMembers> {
  const plan = await prisma.plan.findFirst({
    where: {
      id: planId,
      members: { some: { userId: actorUserId } },
    },
    include: { members: true },
  });

  if (!plan) {
    throw new NotFoundError("plan_not_found", { field: "planId" });
  }

  return plan;
}

function assertMembersBelongToPlan(
  plan: TPlanWithMembers,
  paidByMemberId: string,
  shareMemberIds: string[],
): void {
  const memberIds = new Set(plan.members.map((member) => member.id));

  if (!memberIds.has(paidByMemberId)) {
    throw new ValidationError("invalid_payer", { field: "paidByMemberId" });
  }

  for (const memberId of shareMemberIds) {
    if (!memberIds.has(memberId)) {
      throw new ValidationError("invalid_share_member", {
        field: "shareMemberIds",
      });
    }
  }
}

function shareRows(amount: number, shareMemberIds: string[]) {
  return recalculateEqualExpenseShares(amount, shareMemberIds).map((share) => ({
    memberId: share.memberId,
    shareAmount: new Prisma.Decimal(share.shareAmount.toFixed(2)),
  }));
}

type TExpenseWriteClient = Pick<typeof prisma, "expense" | "expenseShare">;

export async function includeMemberInPastExpenses(
  db: TExpenseWriteClient,
  input: IIncludeMemberInPastExpensesInput,
): Promise<void> {
  const expenses = await db.expense.findMany({
    where: { planId: input.planId },
    include: { shares: { select: { memberId: true } } },
  });

  for (const expense of expenses) {
    const currentShareMemberIds = expense.shares.map((share) => share.memberId);

    if (currentShareMemberIds.length === 0) {
      continue;
    }

    if (currentShareMemberIds.includes(input.memberId)) {
      continue;
    }

    const shareMemberIds = memberIdsWithLateJoiner(
      currentShareMemberIds,
      input.memberId,
    );

    await db.expense.update({
      where: { id: expense.id },
      data: {
        shares: {
          deleteMany: {},
          create: shareRows(toPenNumber(expense.amount), shareMemberIds),
        },
      },
    });
  }
}

export async function excludeMemberFromPlanExpenses(
  db: TExpenseWriteClient,
  input: IExcludeMemberFromPlanExpensesInput,
): Promise<void> {
  const expenses = await db.expense.findMany({
    where: { planId: input.planId },
    include: { shares: { select: { memberId: true } } },
  });

  for (const expense of expenses) {
    if (expense.paidByMemberId === input.memberId) {
      await db.expenseShare.deleteMany({
        where: { expenseId: expense.id },
      });
      await db.expense.delete({
        where: { id: expense.id },
      });
      continue;
    }

    const currentShareMemberIds = expense.shares.map((share) => share.memberId);

    if (!currentShareMemberIds.includes(input.memberId)) {
      continue;
    }

    const shareMemberIds = memberIdsWithoutLeaver(
      currentShareMemberIds,
      input.memberId,
    );

    if (shareMemberIds.length === 0) {
      await db.expenseShare.deleteMany({
        where: { expenseId: expense.id },
      });
      continue;
    }

    await db.expense.update({
      where: { id: expense.id },
      data: {
        shares: {
          deleteMany: {},
          create: shareRows(toPenNumber(expense.amount), shareMemberIds),
        },
      },
    });
  }
}

export async function listExpenseTitlesWithoutShareMembers(
  planId: string,
): Promise<string[]> {
  const expenses = await prisma.expense.findMany({
    where: {
      planId,
      shares: { none: {} },
    },
    select: { title: true },
    orderBy: { createdAt: "asc" },
  });

  return expenses.map((expense) => expense.title);
}

export async function listExpensesForPlan(
  planId: string,
  actorUserId: string,
): Promise<IExpenseListItem[]> {
  await findAccessiblePlanWithMembers(planId, actorUserId);

  const expenses = await prisma.expense.findMany({
    where: { planId },
    include: EXPENSE_LIST_INCLUDE,
    orderBy: { createdAt: "desc" },
  });

  return expenses.map(toExpenseListItem);
}

export async function createExpense(
  input: ICreateExpenseInput,
): Promise<IExpenseListItem> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const denial = getCreateExpenseDenial({
    phase: plan.phase,
    memberCount: plan.members.length,
  });

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  assertMembersBelongToPlan(plan, input.paidByMemberId, input.shareMemberIds);

  const created = await prisma.$transaction(async (tx) => {
    const expense = await tx.expense.create({
      data: {
        planId: input.planId,
        title: input.title,
        amount: new Prisma.Decimal(input.amount.toFixed(2)),
        category: input.category,
        paidByMemberId: input.paidByMemberId,
        shares: {
          create: shareRows(input.amount, input.shareMemberIds),
        },
      },
      include: EXPENSE_LIST_INCLUDE,
    });

    return expense;
  });

  return toExpenseListItem(created);
}

export async function updateExpense(
  input: IUpdateExpenseInput,
): Promise<IExpenseListItem> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const denial = getMutateExpenseDenial(plan.phase);

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  const existing = await prisma.expense.findFirst({
    where: { id: input.expenseId, planId: input.planId },
  });

  if (!existing) {
    throw new NotFoundError("expense_not_found", { field: "expenseId" });
  }

  assertMembersBelongToPlan(plan, input.paidByMemberId, input.shareMemberIds);

  const updated = await prisma.$transaction(async (tx) => {
    return tx.expense.update({
      where: { id: input.expenseId },
      data: {
        title: input.title,
        amount: new Prisma.Decimal(input.amount.toFixed(2)),
        category: input.category,
        paidByMemberId: input.paidByMemberId,
        shares: {
          deleteMany: {},
          create: shareRows(input.amount, input.shareMemberIds),
        },
      },
      include: EXPENSE_LIST_INCLUDE,
    });
  });

  return toExpenseListItem(updated);
}

export async function deleteExpense(input: IDeleteExpenseInput): Promise<void> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const denial = getMutateExpenseDenial(plan.phase);

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  const existing = await prisma.expense.findFirst({
    where: { id: input.expenseId, planId: input.planId },
  });

  if (!existing) {
    throw new NotFoundError("expense_not_found", { field: "expenseId" });
  }

  await prisma.$transaction(async (tx) => {
    await tx.expenseShare.deleteMany({
      where: { expenseId: input.expenseId },
    });
    await tx.expense.delete({
      where: { id: input.expenseId },
    });
  });
}

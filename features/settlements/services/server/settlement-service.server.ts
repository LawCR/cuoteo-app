import { prisma } from "@/core/db";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import { PEN_CENTS } from "@/features/settlements/constants/settlements.constants";
import type { IMemberRemainingBalance } from "@/features/settlements/interfaces/remaining-balance.interface";
import type {
  ICompletePaymentsInput,
  ICompletePlanInput,
  IPlanSettlement,
  IRecordedPaymentView,
  IRecordPaymentInput,
  ISettlementMember,
  ISettlementPayoutDetails,
  ISuggestedTransferView,
  IVoidPaymentInput,
  TPaymentKind,
} from "@/features/settlements/interfaces/settlement.interface";
import { computeMinTransfers } from "@/features/settlements/utils/min-transfers.utils";
import {
  getCompletePaymentsDenial,
  getCompletePlanDenial,
  getPaymentCap,
  getRecordPaymentDenial,
} from "@/features/settlements/utils/payment-rules.utils";
import { computeRemainingBalances } from "@/features/settlements/utils/remaining-balance.utils";
import {
  PaymentKind,
  PlanPhase,
  Prisma,
  type Plan,
  type PlanMember,
} from "@/generated/prisma/client";

const MEMBER_INCLUDE = {
  user: {
    select: {
      name: true,
      phone: true,
      bankName: true,
      cci: true,
      accountNumber: true,
    },
  },
} as const;

type TPlanMemberWithUser = PlanMember & {
  user: {
    name: string;
    phone: string;
    bankName: string | null;
    cci: string | null;
    accountNumber: string | null;
  } | null;
};

type TPlanWithMembers = Plan & { members: TPlanMemberWithUser[] };

function toPenNumber(value: Prisma.Decimal): number {
  return Number(value);
}

function memberDisplayName(member: TPlanMemberWithUser): string {
  if (member.user) {
    return member.user.name;
  }

  return member.ghostName ?? "Invitado";
}

function memberPayout(
  member: TPlanMemberWithUser,
): ISettlementPayoutDetails | null {
  if (!member.user) {
    return null;
  }

  return {
    phone: member.user.phone,
    bankName: member.user.bankName,
    cci: member.user.cci,
    accountNumber: member.user.accountNumber,
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
    include: {
      members: {
        include: MEMBER_INCLUDE,
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!plan) {
    throw new NotFoundError("plan_not_found", { field: "planId" });
  }

  return plan;
}

async function loadBalanceInputs(planId: string): Promise<{
  expenses: Array<{
    paidByMemberId: string;
    amount: number;
    shares: Array<{ memberId: string; shareAmount: number }>;
  }>;
  payments: Array<{
    id: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    createdAt: Date;
    kind: TPaymentKind;
  }>;
}> {
  const [expenseRows, paymentRows] = await Promise.all([
    prisma.expense.findMany({
      where: { planId },
      select: {
        paidByMemberId: true,
        amount: true,
        shares: {
          select: {
            memberId: true,
            shareAmount: true,
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: { planId },
      select: {
        id: true,
        fromMemberId: true,
        toMemberId: true,
        amount: true,
        createdAt: true,
        kind: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return {
    expenses: expenseRows.map((expense) => ({
      paidByMemberId: expense.paidByMemberId,
      amount: toPenNumber(expense.amount),
      shares: expense.shares.map((share) => ({
        memberId: share.memberId,
        shareAmount: toPenNumber(share.shareAmount),
      })),
    })),
    payments: paymentRows.map((payment) => ({
      id: payment.id,
      fromMemberId: payment.fromMemberId,
      toMemberId: payment.toMemberId,
      amount: toPenNumber(payment.amount),
      createdAt: payment.createdAt,
      kind: payment.kind,
    })),
  };
}

function buildSettlementMembers(
  plan: TPlanWithMembers,
  actorUserId: string,
  remainingByMemberId: Map<string, IMemberRemainingBalance>,
): ISettlementMember[] {
  return plan.members.map((member) => {
    const remaining = remainingByMemberId.get(member.id);

    if (!remaining) {
      throw new ValidationError("unknown_member", { field: "memberId" });
    }

    return {
      ...remaining,
      name: memberDisplayName(member),
      isGhost: member.userId === null,
      isSession: member.userId === actorUserId,
      payout: memberPayout(member),
    };
  });
}

function buildRecordedPaymentViews(
  members: ISettlementMember[],
  payments: Array<{
    id: string;
    fromMemberId: string;
    toMemberId: string;
    amount: number;
    createdAt: Date;
    kind: TPaymentKind;
  }>,
): IRecordedPaymentView[] {
  const nameById = new Map(
    members.map((member) => [member.memberId, member.name]),
  );

  return payments.map((payment) => ({
    id: payment.id,
    fromName: nameById.get(payment.fromMemberId) ?? "Integrante",
    toName: nameById.get(payment.toMemberId) ?? "Integrante",
    amount: payment.amount,
    createdAt: payment.createdAt,
    kind: payment.kind,
  }));
}

function buildTransferViews(
  members: ISettlementMember[],
): ISuggestedTransferView[] {
  const nameById = new Map(
    members.map((member) => [member.memberId, member.name]),
  );

  return computeMinTransfers(members).map((transfer) => ({
    ...transfer,
    fromName: nameById.get(transfer.fromMemberId) ?? "Integrante",
    toName: nameById.get(transfer.toMemberId) ?? "Integrante",
  }));
}

export async function getPlanSettlement(
  planId: string,
  actorUserId: string,
): Promise<IPlanSettlement> {
  const plan = await findAccessiblePlanWithMembers(planId, actorUserId);
  const sessionMember = plan.members.find(
    (member) => member.userId === actorUserId,
  );

  if (!sessionMember) {
    throw new NotFoundError("plan_not_found", { field: "planId" });
  }

  const { expenses, payments } = await loadBalanceInputs(plan.id);
  const remaining = computeRemainingBalances(
    plan.members.map((member) => member.id),
    expenses,
    payments,
  );
  const remainingByMemberId = new Map(
    remaining.map((row) => [row.memberId, row]),
  );
  const members = buildSettlementMembers(
    plan,
    actorUserId,
    remainingByMemberId,
  );
  const transfers = buildTransferViews(members);
  const isCreator = plan.creatorUserId === actorUserId;
  const isBalance = plan.phase === PlanPhase.BALANCE;
  const registeredCount = plan.members.filter(
    (member) => member.userId !== null,
  ).length;
  const canCompletePayments = isBalance && isCreator && transfers.length > 0;
  const showCompletePlan = isBalance && isCreator;
  const canCompletePlan = showCompletePlan && transfers.length === 0;

  return {
    planId: plan.id,
    sessionMemberId: sessionMember.id,
    canRecordPayments: isBalance,
    showCompletePayments: isBalance && isCreator,
    canCompletePayments,
    highlightCompletePayments: canCompletePayments && registeredCount === 1,
    showCompletePlan,
    canCompletePlan,
    members,
    transfers,
    payments: buildRecordedPaymentViews(members, payments),
  };
}

export async function recordTransferPayment(
  input: IRecordPaymentInput,
): Promise<void> {
  const plan = await findAccessiblePlanWithMembers(input.planId, input.actorUserId);
  const denial = getRecordPaymentDenial(plan.phase);

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  if (input.fromMemberId === input.toMemberId) {
    throw new ValidationError("same_member", { field: "fromMemberId" });
  }

  const memberIds = new Set(plan.members.map((member) => member.id));

  if (!memberIds.has(input.fromMemberId)) {
    throw new ValidationError("invalid_payer", { field: "fromMemberId" });
  }

  if (!memberIds.has(input.toMemberId)) {
    throw new ValidationError("invalid_payee", { field: "toMemberId" });
  }

  const { expenses, payments } = await loadBalanceInputs(plan.id);
  const remaining = computeRemainingBalances(
    plan.members.map((member) => member.id),
    expenses,
    payments,
  );
  const fromBalance = remaining.find(
    (row) => row.memberId === input.fromMemberId,
  );
  const toBalance = remaining.find((row) => row.memberId === input.toMemberId);

  if (!fromBalance || fromBalance.role !== "debtor") {
    throw new ValidationError("invalid_payer", { field: "fromMemberId" });
  }

  if (!toBalance || toBalance.role !== "creditor") {
    throw new ValidationError("invalid_payee", { field: "toMemberId" });
  }

  const cap = getPaymentCap(fromBalance.remaining, toBalance.remaining);
  const amountCents = Math.round(input.amount * PEN_CENTS);
  const capCents = Math.round(cap * PEN_CENTS);

  if (amountCents <= 0 || amountCents > capCents) {
    throw new ValidationError("amount_exceeds_cap", { field: "amount" });
  }

  await prisma.payment.create({
    data: {
      planId: plan.id,
      fromMemberId: input.fromMemberId,
      toMemberId: input.toMemberId,
      amount: new Prisma.Decimal(input.amount.toFixed(2)),
      recordedByUserId: input.actorUserId,
      kind: PaymentKind.TRANSFER,
    },
  });
}

export async function voidPayment(input: IVoidPaymentInput): Promise<void> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const denial = getRecordPaymentDenial(plan.phase);

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  const payment = await prisma.payment.findFirst({
    where: {
      id: input.paymentId,
      planId: plan.id,
    },
    select: { id: true },
  });

  if (!payment) {
    throw new NotFoundError("payment_not_found", { field: "paymentId" });
  }

  await prisma.payment.delete({
    where: { id: payment.id },
  });
}

export async function completePayments(
  input: ICompletePaymentsInput,
): Promise<void> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const denial = getCompletePaymentsDenial(
    plan.phase,
    input.actorUserId,
    plan.creatorUserId,
  );

  if (denial === "not_plan_creator") {
    throw new UnauthorizedError(denial, { field: "planId" });
  }

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  const { expenses, payments } = await loadBalanceInputs(plan.id);
  const remaining = computeRemainingBalances(
    plan.members.map((member) => member.id),
    expenses,
    payments,
  );
  const transfers = computeMinTransfers(remaining);

  if (transfers.length === 0) {
    throw new ValidationError("already_settled", { field: "planId" });
  }

  await prisma.payment.createMany({
    data: transfers.map((transfer) => ({
      planId: plan.id,
      fromMemberId: transfer.fromMemberId,
      toMemberId: transfer.toMemberId,
      amount: new Prisma.Decimal(transfer.amount.toFixed(2)),
      recordedByUserId: input.actorUserId,
      kind: PaymentKind.MANUAL_CLOSE,
    })),
  });
}

export async function completePlan(input: ICompletePlanInput): Promise<void> {
  const plan = await findAccessiblePlanWithMembers(
    input.planId,
    input.actorUserId,
  );
  const { expenses, payments } = await loadBalanceInputs(plan.id);
  const remaining = computeRemainingBalances(
    plan.members.map((member) => member.id),
    expenses,
    payments,
  );
  const transfers = computeMinTransfers(remaining);
  const denial = getCompletePlanDenial(
    plan.phase,
    input.actorUserId,
    plan.creatorUserId,
    transfers.length === 0,
  );

  if (denial === "not_plan_creator") {
    throw new UnauthorizedError(denial, { field: "planId" });
  }

  if (denial) {
    throw new ValidationError(denial, { field: "planId" });
  }

  await prisma.plan.update({
    where: { id: plan.id },
    data: { phase: PlanPhase.COMPLETED },
  });
}

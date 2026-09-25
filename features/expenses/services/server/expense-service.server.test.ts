import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/core/errors/not-found.error";
import { ValidationError } from "@/core/errors/validation.error";
import { PlanPhase } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  planFindFirst: vi.fn(),
  expenseFindMany: vi.fn(),
  expenseFindFirst: vi.fn(),
  expenseCreate: vi.fn(),
  expenseUpdate: vi.fn(),
  expenseDelete: vi.fn(),
  expenseShareDeleteMany: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/core/db", () => ({
  prisma: {
    plan: {
      findFirst: mocks.planFindFirst,
    },
    expense: {
      findMany: mocks.expenseFindMany,
      findFirst: mocks.expenseFindFirst,
      create: mocks.expenseCreate,
      update: mocks.expenseUpdate,
      delete: mocks.expenseDelete,
    },
    expenseShare: {
      deleteMany: mocks.expenseShareDeleteMany,
    },
    $transaction: mocks.transaction,
  },
}));

import {
  createExpense,
  deleteExpense,
  updateExpense,
} from "@/features/expenses/services/server/expense-service.server";

const PLAN_ID = "plan-1";
const ACTOR_ID = "user-1";
const MEMBER_A = "member-a";
const MEMBER_B = "member-b";

const MEMBER_C = "member-c";

function makePlan(phase: PlanPhase = PlanPhase.ACTIVE, memberCount = 2) {
  const members = [
    { id: MEMBER_A, planId: PLAN_ID, userId: ACTOR_ID, ghostName: null },
    { id: MEMBER_B, planId: PLAN_ID, userId: "user-2", ghostName: null },
    { id: MEMBER_C, planId: PLAN_ID, userId: "user-3", ghostName: null },
  ].slice(0, memberCount);

  return {
    id: PLAN_ID,
    name: "Asado",
    icon: "FOOD" as const,
    phase,
    creatorUserId: ACTOR_ID,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    members,
  };
}

function shareAmountsFromCall(call: {
  data: {
    shares: {
      create: Array<{ memberId: string; shareAmount: { toString(): string } }>;
    };
  };
}): Array<{ memberId: string; shareAmount: number }> {
  return call.data.shares.create.map((share) => ({
    memberId: share.memberId,
    shareAmount: Number(share.shareAmount.toString()),
  }));
}

function makeExpenseRecord() {
  return {
    id: "expense-1",
    planId: PLAN_ID,
    title: "Ceviche",
    amount: "100.00",
    category: "FOOD" as const,
    paidByMemberId: MEMBER_A,
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
    paidByMember: {
      ghostName: null,
      user: { name: "Alvaro" },
    },
    shares: [
      { memberId: MEMBER_A, shareAmount: "50.00" },
      { memberId: MEMBER_B, shareAmount: "50.00" },
    ],
  };
}

describe("createExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        expense: { create: mocks.expenseCreate },
      }),
    );
  });

  it("rechaza si no hay 2 integrantes", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE, 1));

    await expect(
      createExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        title: "Ceviche",
        amount: 100,
        category: "FOOD",
        paidByMemberId: MEMBER_A,
        shareMemberIds: [MEMBER_A],
      }),
    ).rejects.toMatchObject({ message: "not_enough_members" });
    expect(mocks.expenseCreate).not.toHaveBeenCalled();
  });

  it("rechaza fuera de Activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      createExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        title: "Ceviche",
        amount: 100,
        category: "FOOD",
        paidByMemberId: MEMBER_A,
        shareMemberIds: [MEMBER_A, MEMBER_B],
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });

  it("crea el gasto con split igualitario", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseCreate.mockResolvedValue(makeExpenseRecord());

    const result = await createExpense({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      title: "Ceviche",
      amount: 100,
      category: "FOOD",
      paidByMemberId: MEMBER_A,
      shareMemberIds: [MEMBER_B, MEMBER_A],
    });

    expect(result.amount).toBe(100);
    expect(result.shareMemberIds).toEqual([MEMBER_A, MEMBER_B]);
    expect(mocks.expenseCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "Ceviche",
          paidByMemberId: MEMBER_A,
          shares: {
            create: [
              { memberId: MEMBER_B, shareAmount: expect.anything() },
              { memberId: MEMBER_A, shareAmount: expect.anything() },
            ],
          },
        }),
      }),
    );
  });

  it("rechaza un pagador que no es integrante", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan());

    await expect(
      createExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        title: "Ceviche",
        amount: 100,
        category: "FOOD",
        paidByMemberId: "other",
        shareMemberIds: [MEMBER_A, MEMBER_B],
      }),
    ).rejects.toMatchObject({ message: "invalid_payer" });
  });
});

describe("updateExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindFirst.mockResolvedValue({ id: "expense-1", planId: PLAN_ID });
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        expense: { update: mocks.expenseUpdate },
      }),
    );
    mocks.expenseUpdate.mockResolvedValue(makeExpenseRecord());
  });

  it("reemplaza shares con split coherente al cambiar monto y exclusión", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE, 3));

    await updateExpense({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      expenseId: "expense-1",
      title: "Ceviche XL",
      amount: 10,
      category: "FOOD",
      paidByMemberId: MEMBER_A,
      shareMemberIds: [MEMBER_C, MEMBER_A, MEMBER_B],
    });

    const shares = shareAmountsFromCall(mocks.expenseUpdate.mock.calls[0][0]);
    expect(shares).toEqual([
      { memberId: MEMBER_C, shareAmount: 3.33 },
      { memberId: MEMBER_A, shareAmount: 3.34 },
      { memberId: MEMBER_B, shareAmount: 3.33 },
    ]);
    expect(
      mocks.expenseUpdate.mock.calls[0][0].data.shares.deleteMany,
    ).toEqual({});
    expect(shares.reduce((total, share) => total + Math.round(share.shareAmount * 100), 0)).toBe(
      1000,
    );
  });

  it("recalcula entre los no excluidos", async () => {
    await updateExpense({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      expenseId: "expense-1",
      title: "Ceviche",
      amount: 10,
      category: "FOOD",
      paidByMemberId: MEMBER_A,
      shareMemberIds: [MEMBER_B],
    });

    expect(shareAmountsFromCall(mocks.expenseUpdate.mock.calls[0][0])).toEqual([
      { memberId: MEMBER_B, shareAmount: 10 },
    ]);
  });

  it("bloquea el recálculo fuera de Activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      updateExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        expenseId: "expense-1",
        title: "Ceviche",
        amount: 10,
        category: "FOOD",
        paidByMemberId: MEMBER_A,
        shareMemberIds: [MEMBER_A, MEMBER_B],
      }),
    ).rejects.toMatchObject({ message: "plan_not_active" });
    expect(mocks.expenseUpdate).not.toHaveBeenCalled();
  });

  it("rechaza un gasto de otro plan", async () => {
    mocks.expenseFindFirst.mockResolvedValue(null);

    await expect(
      updateExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        expenseId: "missing",
        title: "Ceviche",
        amount: 10,
        category: "FOOD",
        paidByMemberId: MEMBER_A,
        shareMemberIds: [MEMBER_A, MEMBER_B],
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deleteExpense", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindFirst.mockResolvedValue({ id: "expense-1", planId: PLAN_ID });
    mocks.transaction.mockImplementation(async (callback: (tx: unknown) => unknown) =>
      callback({
        expenseShare: { deleteMany: mocks.expenseShareDeleteMany },
        expense: { delete: mocks.expenseDelete },
      }),
    );
  });

  it("borra el gasto y sus shares en Activo", async () => {
    await deleteExpense({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      expenseId: "expense-1",
    });

    expect(mocks.expenseShareDeleteMany).toHaveBeenCalledWith({
      where: { expenseId: "expense-1" },
    });
    expect(mocks.expenseDelete).toHaveBeenCalledWith({
      where: { id: "expense-1" },
    });
    expect(mocks.expenseUpdate).not.toHaveBeenCalled();
  });

  it("bloquea en Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      deleteExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        expenseId: "expense-1",
      }),
    ).rejects.toMatchObject({ message: "plan_not_active" });
    expect(mocks.expenseDelete).not.toHaveBeenCalled();
  });

  it("bloquea en Balance", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      deleteExpense({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        expenseId: "expense-1",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});

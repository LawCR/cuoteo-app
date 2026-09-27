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

import { prisma } from "@/core/db";
import {
  createExpense,
  deleteExpense,
  excludeMemberFromPlanExpenses,
  includeMemberInPastExpenses,
  listExpenseTitlesWithoutShareMembers,
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

  it("permite editar con un solo integrante en Activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE, 1));

    await updateExpense({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      expenseId: "expense-1",
      title: "Ceviche",
      amount: 10,
      category: "FOOD",
      paidByMemberId: MEMBER_A,
      shareMemberIds: [MEMBER_A],
    });

    expect(mocks.expenseUpdate).toHaveBeenCalled();
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

describe("includeMemberInPastExpenses", () => {
  const MEMBER_D = "member-d";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("inserta al tardío en todos los gastos, respeta exclusiones y no cambia el pagador", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      {
        id: "expense-full",
        amount: "90.00",
        paidByMemberId: MEMBER_A,
        shares: [{ memberId: MEMBER_A }, { memberId: MEMBER_B }],
      },
      {
        id: "expense-excluded",
        amount: "10.00",
        paidByMemberId: MEMBER_B,
        shares: [{ memberId: MEMBER_A }],
      },
    ]);

    await includeMemberInPastExpenses(prisma, {
      planId: PLAN_ID,
      memberId: MEMBER_D,
    });

    expect(mocks.expenseUpdate.mock.calls).toHaveLength(2);

    const fullShares = shareAmountsFromCall(mocks.expenseUpdate.mock.calls[0][0]);
    expect(mocks.expenseUpdate.mock.calls[0][0].where).toEqual({
      id: "expense-full",
    });
    expect(fullShares).toEqual([
      { memberId: MEMBER_A, shareAmount: 30 },
      { memberId: MEMBER_B, shareAmount: 30 },
      { memberId: MEMBER_D, shareAmount: 30 },
    ]);
    expect(mocks.expenseUpdate.mock.calls[0][0].data.paidByMemberId).toBeUndefined();

    const excludedShares = shareAmountsFromCall(
      mocks.expenseUpdate.mock.calls[1][0],
    );
    expect(excludedShares).toEqual([
      { memberId: MEMBER_A, shareAmount: 5 },
      { memberId: MEMBER_D, shareAmount: 5 },
    ]);
  });

  it("no toca un gasto si el tardío ya participa", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      {
        id: "expense-1",
        amount: "10.00",
        paidByMemberId: MEMBER_A,
        shares: [{ memberId: MEMBER_A }, { memberId: MEMBER_D }],
      },
    ]);

    await includeMemberInPastExpenses(prisma, {
      planId: PLAN_ID,
      memberId: MEMBER_D,
    });

    expect(mocks.expenseUpdate).not.toHaveBeenCalled();
  });

  it("no toca un gasto sin integrantes", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      {
        id: "expense-empty",
        amount: "10.00",
        paidByMemberId: MEMBER_A,
        shares: [],
      },
    ]);

    await includeMemberInPastExpenses(prisma, {
      planId: PLAN_ID,
      memberId: MEMBER_D,
    });

    expect(mocks.expenseUpdate).not.toHaveBeenCalled();
  });
});

describe("excludeMemberFromPlanExpenses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("borra los gastos que pagó y recalcula los demás", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      {
        id: "paid-by-leaver",
        amount: "40.00",
        paidByMemberId: MEMBER_B,
        shares: [{ memberId: MEMBER_A }, { memberId: MEMBER_B }],
      },
      {
        id: "shared-with-others",
        amount: "90.00",
        paidByMemberId: MEMBER_A,
        shares: [
          { memberId: MEMBER_A },
          { memberId: MEMBER_B },
          { memberId: MEMBER_C },
        ],
      },
    ]);

    await excludeMemberFromPlanExpenses(prisma, {
      planId: PLAN_ID,
      memberId: MEMBER_B,
    });

    expect(mocks.expenseShareDeleteMany).toHaveBeenCalledWith({
      where: { expenseId: "paid-by-leaver" },
    });
    expect(mocks.expenseDelete).toHaveBeenCalledWith({
      where: { id: "paid-by-leaver" },
    });
    expect(shareAmountsFromCall(mocks.expenseUpdate.mock.calls[0][0])).toEqual([
      { memberId: MEMBER_A, shareAmount: 45 },
      { memberId: MEMBER_C, shareAmount: 45 },
    ]);
  });

  it("deja el gasto sin shares si era el único incluido", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      {
        id: "only-leaver",
        amount: "20.00",
        paidByMemberId: MEMBER_A,
        shares: [{ memberId: MEMBER_B }],
      },
    ]);

    await excludeMemberFromPlanExpenses(prisma, {
      planId: PLAN_ID,
      memberId: MEMBER_B,
    });

    expect(mocks.expenseShareDeleteMany).toHaveBeenCalledWith({
      where: { expenseId: "only-leaver" },
    });
    expect(mocks.expenseDelete).not.toHaveBeenCalled();
    expect(mocks.expenseUpdate).not.toHaveBeenCalled();
  });
});

describe("listExpenseTitlesWithoutShareMembers", () => {
  it("devuelve los títulos en orden de creación", async () => {
    mocks.expenseFindMany.mockResolvedValue([
      { title: "Taxi" },
      { title: "Cena" },
    ]);

    await expect(listExpenseTitlesWithoutShareMembers(PLAN_ID)).resolves.toEqual(
      ["Taxi", "Cena"],
    );
    expect(mocks.expenseFindMany).toHaveBeenCalledWith({
      where: {
        planId: PLAN_ID,
        shares: { none: {} },
      },
      select: { title: true },
      orderBy: { createdAt: "asc" },
    });
  });
});

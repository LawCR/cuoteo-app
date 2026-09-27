import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import { PaymentKind, PlanPhase } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  planFindFirst: vi.fn(),
  expenseFindMany: vi.fn(),
  paymentFindMany: vi.fn(),
  paymentFindFirst: vi.fn(),
  paymentCreate: vi.fn(),
  paymentCreateMany: vi.fn(),
  paymentDelete: vi.fn(),
  planUpdate: vi.fn(),
}));

vi.mock("@/core/db", () => ({
  prisma: {
    plan: {
      findFirst: mocks.planFindFirst,
      update: mocks.planUpdate,
    },
    expense: {
      findMany: mocks.expenseFindMany,
    },
    payment: {
      findMany: mocks.paymentFindMany,
      findFirst: mocks.paymentFindFirst,
      create: mocks.paymentCreate,
      createMany: mocks.paymentCreateMany,
      delete: mocks.paymentDelete,
    },
  },
}));

import {
  completePayments,
  completePlan,
  getPlanSettlement,
  recordTransferPayment,
  voidPayment,
} from "@/features/settlements/services/server/settlement-service.server";

const PLAN_ID = "plan-1";
const ACTOR_ID = "user-1";
const MEMBER_A = "member-a";
const MEMBER_B = "member-b";
const MEMBER_C = "member-c";

function makeMembers() {
  return [
    {
      id: MEMBER_A,
      planId: PLAN_ID,
      userId: ACTOR_ID,
      ghostName: null,
      createdAt: new Date("2026-01-01"),
      user: {
        name: "Ana",
        phone: "+51911111111",
        bankName: "BCP",
        cci: "00211111111111111111",
        accountNumber: "12345678",
      },
    },
    {
      id: MEMBER_B,
      planId: PLAN_ID,
      userId: "user-2",
      ghostName: null,
      createdAt: new Date("2026-01-02"),
      user: {
        name: "Beto",
        phone: "+51922222222",
        bankName: null,
        cci: null,
        accountNumber: null,
      },
    },
    {
      id: MEMBER_C,
      planId: PLAN_ID,
      userId: null,
      ghostName: "Carla",
      createdAt: new Date("2026-01-03"),
      user: null,
    },
  ];
}

function makePlan(phase: PlanPhase = PlanPhase.BALANCE) {
  return {
    id: PLAN_ID,
    name: "Asado",
    icon: "FOOD" as const,
    phase,
    creatorUserId: ACTOR_ID,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
    members: makeMembers(),
  };
}

function equalSplitExpense() {
  return {
    paidByMemberId: MEMBER_A,
    amount: "90.00",
    shares: [
      { memberId: MEMBER_A, shareAmount: "30.00" },
      { memberId: MEMBER_B, shareAmount: "30.00" },
      { memberId: MEMBER_C, shareAmount: "30.00" },
    ],
  };
}

describe("getPlanSettlement", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindMany.mockResolvedValue([equalSplitExpense()]);
    mocks.paymentFindMany.mockResolvedValue([]);
  });

  it("calcula restantes, badges y transferencias mínimas", async () => {
    const settlement = await getPlanSettlement(PLAN_ID, ACTOR_ID);

    expect(settlement.canRecordPayments).toBe(true);
    expect(settlement.showCompletePayments).toBe(true);
    expect(settlement.canCompletePayments).toBe(true);
    expect(settlement.highlightCompletePayments).toBe(false);
    expect(settlement.showCompletePlan).toBe(true);
    expect(settlement.canCompletePlan).toBe(false);
    expect(settlement.showSuggestedTransfers).toBe(true);
    expect(settlement.members.map((member) => member.role)).toEqual([
      "creditor",
      "debtor",
      "debtor",
    ]);
    expect(settlement.transfers).toEqual([
      {
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: 30,
        fromName: "Beto",
        toName: "Ana",
      },
      {
        fromMemberId: MEMBER_C,
        toMemberId: MEMBER_A,
        amount: 30,
        fromName: "Carla",
        toName: "Ana",
      },
    ]);
  });

  it("recalcula el greedy después de un pago", async () => {
    mocks.paymentFindMany.mockResolvedValue([
      {
        id: "pay-1",
        fromMemberId: MEMBER_C,
        toMemberId: MEMBER_A,
        amount: "10.00",
        createdAt: new Date("2026-03-01"),
        kind: PaymentKind.TRANSFER,
      },
    ]);

    const settlement = await getPlanSettlement(PLAN_ID, ACTOR_ID);

    expect(settlement.transfers).toEqual([
      {
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: 30,
        fromName: "Beto",
        toName: "Ana",
      },
      {
        fromMemberId: MEMBER_C,
        toMemberId: MEMBER_A,
        amount: 20,
        fromName: "Carla",
        toName: "Ana",
      },
    ]);
    expect(settlement.payments).toEqual([
      {
        id: "pay-1",
        fromName: "Carla",
        toName: "Ana",
        amount: 10,
        createdAt: new Date("2026-03-01"),
        kind: PaymentKind.TRANSFER,
      },
    ]);
  });

  it("destaca Completar pagos si hay un solo registrado", async () => {
    const plan = makePlan();
    plan.members = plan.members.filter((member) => member.id !== MEMBER_B);
    mocks.planFindFirst.mockResolvedValue(plan);
    mocks.expenseFindMany.mockResolvedValue([
      {
        paidByMemberId: MEMBER_A,
        amount: "40.00",
        shares: [
          { memberId: MEMBER_A, shareAmount: "20.00" },
          { memberId: MEMBER_C, shareAmount: "20.00" },
        ],
      },
    ]);

    const settlement = await getPlanSettlement(PLAN_ID, ACTOR_ID);

    expect(settlement.highlightCompletePayments).toBe(true);
    expect(settlement.canCompletePayments).toBe(true);
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(getPlanSettlement(PLAN_ID, ACTOR_ID)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("en Completado muestra historial sin mutaciones", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    const settlement = await getPlanSettlement(PLAN_ID, ACTOR_ID);

    expect(settlement.canRecordPayments).toBe(false);
    expect(settlement.showSuggestedTransfers).toBe(false);
    expect(settlement.showCompletePayments).toBe(false);
    expect(settlement.showCompletePlan).toBe(false);
  });
});

describe("recordTransferPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindMany.mockResolvedValue([equalSplitExpense()]);
    mocks.paymentFindMany.mockResolvedValue([]);
    mocks.paymentCreate.mockResolvedValue({ id: "pay-1" });
  });

  it("registra un pago parcial dentro del tope", async () => {
    await recordTransferPayment({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      fromMemberId: MEMBER_B,
      toMemberId: MEMBER_A,
      amount: 20,
    });

    expect(mocks.paymentCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          planId: PLAN_ID,
          fromMemberId: MEMBER_B,
          toMemberId: MEMBER_A,
          recordedByUserId: ACTOR_ID,
          kind: PaymentKind.TRANSFER,
        }),
      }),
    );
  });

  it("rechaza un monto por encima de min(|deuda|, |crédito|)", async () => {
    await expect(
      recordTransferPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: 30.01,
      }),
    ).rejects.toMatchObject({ message: "amount_exceeds_cap" });
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });

  it("no permite que el acreedor se pague a sí mismo", async () => {
    await expect(
      recordTransferPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        fromMemberId: MEMBER_A,
        toMemberId: MEMBER_A,
        amount: 10,
      }),
    ).rejects.toMatchObject({ message: "same_member" });
  });

  it("bloquea fuera de Balance", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE));

    await expect(
      recordTransferPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: 10,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.paymentCreate).not.toHaveBeenCalled();
  });
});

describe("voidPayment", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.paymentFindFirst.mockResolvedValue({ id: "pay-1" });
    mocks.paymentDelete.mockResolvedValue({ id: "pay-1" });
  });

  it("borra el pago en Balance", async () => {
    await voidPayment({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
      paymentId: "pay-1",
    });

    expect(mocks.paymentFindFirst).toHaveBeenCalledWith({
      where: { id: "pay-1", planId: PLAN_ID },
      select: { id: true },
    });
    expect(mocks.paymentDelete).toHaveBeenCalledWith({
      where: { id: "pay-1" },
    });
  });

  it("bloquea en Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      voidPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        paymentId: "pay-1",
      }),
    ).rejects.toMatchObject({ message: "plan_not_in_balance" });
    expect(mocks.paymentDelete).not.toHaveBeenCalled();
  });

  it("bloquea fuera de Balance", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE));

    await expect(
      voidPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        paymentId: "pay-1",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.paymentDelete).not.toHaveBeenCalled();
  });

  it("rechaza un pago que no pertenece al plan", async () => {
    mocks.paymentFindFirst.mockResolvedValue(null);

    await expect(
      voidPayment({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
        paymentId: "pay-missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(mocks.paymentDelete).not.toHaveBeenCalled();
  });
});

describe("completePayments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindMany.mockResolvedValue([equalSplitExpense()]);
    mocks.paymentFindMany.mockResolvedValue([]);
    mocks.paymentCreateMany.mockResolvedValue({ count: 2 });
  });

  it("crea asientos MANUAL_CLOSE y no cambia la fase", async () => {
    await completePayments({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
    });

    expect(mocks.paymentCreateMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({
          planId: PLAN_ID,
          fromMemberId: MEMBER_B,
          toMemberId: MEMBER_A,
          recordedByUserId: ACTOR_ID,
          kind: PaymentKind.MANUAL_CLOSE,
        }),
        expect.objectContaining({
          planId: PLAN_ID,
          fromMemberId: MEMBER_C,
          toMemberId: MEMBER_A,
          recordedByUserId: ACTOR_ID,
          kind: PaymentKind.MANUAL_CLOSE,
        }),
      ],
    });
    expect(mocks.paymentDelete).not.toHaveBeenCalled();
  });

  it("rechaza si los saldos ya están en cero", async () => {
    mocks.paymentFindMany.mockResolvedValue([
      {
        id: "pay-1",
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: "30.00",
        createdAt: new Date("2026-03-01"),
        kind: PaymentKind.TRANSFER,
      },
      {
        id: "pay-2",
        fromMemberId: MEMBER_C,
        toMemberId: MEMBER_A,
        amount: "30.00",
        createdAt: new Date("2026-03-02"),
        kind: PaymentKind.TRANSFER,
      },
    ]);

    await expect(
      completePayments({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "already_settled" });
    expect(mocks.paymentCreateMany).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no es el creador", async () => {
    await expect(
      completePayments({
        actorUserId: "user-2",
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.paymentCreateMany).not.toHaveBeenCalled();
  });

  it("bloquea fuera de Balance", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      completePayments({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "plan_not_in_balance" });
    expect(mocks.paymentCreateMany).not.toHaveBeenCalled();
  });
});

describe("completePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.expenseFindMany.mockResolvedValue([equalSplitExpense()]);
    mocks.paymentFindMany.mockResolvedValue([
      {
        id: "pay-1",
        fromMemberId: MEMBER_B,
        toMemberId: MEMBER_A,
        amount: "30.00",
        createdAt: new Date("2026-03-01"),
        kind: PaymentKind.TRANSFER,
      },
      {
        id: "pay-2",
        fromMemberId: MEMBER_C,
        toMemberId: MEMBER_A,
        amount: "30.00",
        createdAt: new Date("2026-03-02"),
        kind: PaymentKind.TRANSFER,
      },
    ]);
    mocks.planUpdate.mockResolvedValue(makePlan(PlanPhase.COMPLETED));
  });

  it("pasa a Completado cuando los saldos ya están en cero", async () => {
    await completePlan({
      actorUserId: ACTOR_ID,
      planId: PLAN_ID,
    });

    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: PLAN_ID },
      data: { phase: PlanPhase.COMPLETED },
    });
  });

  it("rechaza si aún hay saldos", async () => {
    mocks.paymentFindMany.mockResolvedValue([]);

    await expect(
      completePlan({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "balances_not_settled" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no es el creador", async () => {
    await expect(
      completePlan({
        actorUserId: "user-2",
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea fuera de Balance", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      completePlan({
        actorUserId: ACTOR_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "plan_not_in_balance" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });
});

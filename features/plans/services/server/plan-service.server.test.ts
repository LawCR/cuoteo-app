import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotFoundError } from "@/core/errors/not-found.error";
import { UnauthorizedError } from "@/core/errors/unauthorized.error";
import { ValidationError } from "@/core/errors/validation.error";
import { PlanPhase } from "@/generated/prisma/client";

const mocks = vi.hoisted(() => ({
  planFindFirst: vi.fn(),
  planUpdate: vi.fn(),
  planDelete: vi.fn(),
  planMemberFindUnique: vi.fn(),
  planMemberFindFirst: vi.fn(),
  planMemberCreate: vi.fn(),
  planMemberDelete: vi.fn(),
  planMemberCount: vi.fn(),
  friendshipFindUnique: vi.fn(),
  includeMemberInPastExpenses: vi.fn(),
  excludeMemberFromPlanExpenses: vi.fn(),
  listExpenseTitlesWithoutShareMembers: vi.fn(),
  countExpensesForPlan: vi.fn(),
  paymentCount: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/features/expenses/services/server/expense-service.server", () => ({
  includeMemberInPastExpenses: mocks.includeMemberInPastExpenses,
  excludeMemberFromPlanExpenses: mocks.excludeMemberFromPlanExpenses,
  listExpenseTitlesWithoutShareMembers: mocks.listExpenseTitlesWithoutShareMembers,
  countExpensesForPlan: mocks.countExpensesForPlan,
}));

vi.mock("@/core/db", () => ({
  prisma: {
    plan: {
      findFirst: mocks.planFindFirst,
      update: mocks.planUpdate,
      delete: mocks.planDelete,
    },
    planMember: {
      findUnique: mocks.planMemberFindUnique,
      findFirst: mocks.planMemberFindFirst,
      create: mocks.planMemberCreate,
      delete: mocks.planMemberDelete,
      count: mocks.planMemberCount,
    },
    friendship: {
      findUnique: mocks.friendshipFindUnique,
    },
    payment: {
      count: mocks.paymentCount,
    },
    $transaction: mocks.transaction,
  },
}));

import {
  addFriendToPlan,
  addGhostToPlan,
  deletePlan,
  leavePlan,
  movePlanToActive,
  movePlanToBalance,
  removePlanMember,
} from "@/features/plans/services/server/plan-service.server";

const PLAN_ID = "plan-1";
const CREATOR_ID = "creator-1";
const MEMBER_USER_ID = "member-1";
const MEMBER_ROW_ID = "pm-member";
const GHOST_ROW_ID = "pm-ghost";
const CREATOR_ROW_ID = "pm-creator";

function makePlan(phase: PlanPhase = PlanPhase.ACTIVE) {
  return {
    id: PLAN_ID,
    name: "Asado",
    icon: "FOOD" as const,
    phase,
    creatorUserId: CREATOR_ID,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  };
}

describe("leavePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberFindUnique.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });
    mocks.planMemberDelete.mockResolvedValue({});
    mocks.excludeMemberFromPlanExpenses.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => unknown) =>
        callback({
          planMember: { delete: mocks.planMemberDelete },
        }),
    );
  });

  it("borra gastos del pagador, recalcula el resto y quita la membresía", async () => {
    await leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID });

    expect(mocks.excludeMemberFromPlanExpenses).toHaveBeenCalledWith(
      expect.objectContaining({
        planMember: { delete: mocks.planMemberDelete },
      }),
      { planId: PLAN_ID, memberId: MEMBER_ROW_ID },
    );
    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: MEMBER_ROW_ID },
    });
  });

  it("rechaza al creador", async () => {
    await expect(
      leavePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID }),
    ).rejects.toMatchObject({
      message: "creator_cannot_leave",
    });
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el plan no está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza mutaciones en Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      leavePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("removePlanMember", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberDelete.mockResolvedValue({});
    mocks.excludeMemberFromPlanExpenses.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => unknown) =>
        callback({
          planMember: { delete: mocks.planMemberDelete },
        }),
    );
  });

  it("permite al creador quitar a un registrado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });

    await removePlanMember({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      memberId: MEMBER_ROW_ID,
    });

    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: MEMBER_ROW_ID },
    });
  });

  it("permite a un integrante quitar un invitado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: GHOST_ROW_ID,
      planId: PLAN_ID,
      userId: null,
    });

    await removePlanMember({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
      memberId: GHOST_ROW_ID,
    });

    expect(mocks.planMemberDelete).toHaveBeenCalledWith({
      where: { id: GHOST_ROW_ID },
    });
  });

  it("impide a un integrante quitar a otro registrado", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: MEMBER_ROW_ID,
      planId: PLAN_ID,
      userId: MEMBER_USER_ID,
    });

    await expect(
      removePlanMember({
        actorUserId: "other-member",
        planId: PLAN_ID,
        memberId: MEMBER_ROW_ID,
      }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("impide quitar al creador", async () => {
    mocks.planMemberFindFirst.mockResolvedValue({
      id: CREATOR_ROW_ID,
      planId: PLAN_ID,
      userId: CREATOR_ID,
    });

    await expect(
      removePlanMember({
        actorUserId: CREATOR_ID,
        planId: PLAN_ID,
        memberId: CREATOR_ROW_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planMemberDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el integrante no está en el plan", async () => {
    mocks.planMemberFindFirst.mockResolvedValue(null);

    await expect(
      removePlanMember({
        actorUserId: CREATOR_ID,
        planId: PLAN_ID,
        memberId: "missing",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("movePlanToBalance", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberCount.mockResolvedValue(2);
    mocks.countExpensesForPlan.mockResolvedValue(1);
    mocks.listExpenseTitlesWithoutShareMembers.mockResolvedValue([]);
    mocks.planUpdate.mockResolvedValue(makePlan(PlanPhase.BALANCE));
  });

  it("pasa a Balance con al menos 2 integrantes", async () => {
    const result = await movePlanToBalance({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
    });

    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: PLAN_ID },
      data: { phase: PlanPhase.BALANCE },
    });
    expect(result.phase).toBe(PlanPhase.BALANCE);
  });

  it("bloquea con menos de 2 integrantes", async () => {
    mocks.planMemberCount.mockResolvedValue(1);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "not_enough_members" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea sin gastos", async () => {
    mocks.countExpensesForPlan.mockResolvedValue(0);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "not_enough_expenses" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea si el plan no está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea si hay gastos sin integrantes", async () => {
    mocks.listExpenseTitlesWithoutShareMembers.mockResolvedValue(["Taxi"]);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({
      message: "expenses_missing_share_members",
      meta: { expenseTitles: ["Taxi"] },
    });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      movePlanToBalance({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("movePlanToActive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.BALANCE));
    mocks.planUpdate.mockResolvedValue(makePlan(PlanPhase.ACTIVE));
    mocks.paymentCount.mockResolvedValue(0);
  });

  it("vuelve a Activo desde Balance sin pagos", async () => {
    const result = await movePlanToActive({
      actorUserId: MEMBER_USER_ID,
      planId: PLAN_ID,
    });

    expect(mocks.planUpdate).toHaveBeenCalledWith({
      where: { id: PLAN_ID },
      data: { phase: PlanPhase.ACTIVE },
    });
    expect(result.phase).toBe(PlanPhase.ACTIVE);
  });

  it("bloquea si ya hay pagos", async () => {
    mocks.paymentCount.mockResolvedValue(1);

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "has_payments" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea si el plan está activo", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.ACTIVE));

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toMatchObject({ message: "plan_not_in_balance" });
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("bloquea Completado", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan(PlanPhase.COMPLETED));

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(mocks.planUpdate).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      movePlanToActive({
        actorUserId: MEMBER_USER_ID,
        planId: PLAN_ID,
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});

describe("deletePlan", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planDelete.mockResolvedValue({});
  });

  it.each([PlanPhase.ACTIVE, PlanPhase.BALANCE, PlanPhase.COMPLETED])(
    "permite al creador borrar en fase %s",
    async (phase) => {
      mocks.planFindFirst.mockResolvedValue(makePlan(phase));

      await deletePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID });

      expect(mocks.planDelete).toHaveBeenCalledWith({
        where: { id: PLAN_ID },
      });
    },
  );

  it("impide a un integrante que no es creador", async () => {
    mocks.planFindFirst.mockResolvedValue(makePlan());

    await expect(
      deletePlan({ actorUserId: MEMBER_USER_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(UnauthorizedError);
    expect(mocks.planDelete).not.toHaveBeenCalled();
  });

  it("rechaza si el actor no pertenece al plan", async () => {
    mocks.planFindFirst.mockResolvedValue(null);

    await expect(
      deletePlan({ actorUserId: CREATOR_ID, planId: PLAN_ID }),
    ).rejects.toBeInstanceOf(NotFoundError);
    expect(mocks.planDelete).not.toHaveBeenCalled();
  });
});

describe("addFriendToPlan", () => {
  const FRIEND_USER_ID = "friend-1";
  const NEW_MEMBER_ID = "pm-new-friend";

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberFindUnique.mockResolvedValue(null);
    mocks.friendshipFindUnique.mockResolvedValue({ id: "friendship-1" });
    mocks.planMemberCreate.mockResolvedValue({ id: NEW_MEMBER_ID });
    mocks.includeMemberInPastExpenses.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => unknown) =>
        callback({
          planMember: { create: mocks.planMemberCreate },
        }),
    );
  });

  it("opción A crea el integrante y no toca gastos", async () => {
    await addFriendToPlan({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      friendUserId: FRIEND_USER_ID,
      includeInPastExpenses: false,
    });

    expect(mocks.planMemberCreate).toHaveBeenCalledWith({
      data: {
        planId: PLAN_ID,
        userId: FRIEND_USER_ID,
      },
    });
    expect(mocks.transaction).not.toHaveBeenCalled();
    expect(mocks.includeMemberInPastExpenses).not.toHaveBeenCalled();
  });

  it("opción B crea el integrante e incluye gastos pasados en la misma transacción", async () => {
    await addFriendToPlan({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      friendUserId: FRIEND_USER_ID,
      includeInPastExpenses: true,
    });

    expect(mocks.transaction).toHaveBeenCalled();
    expect(mocks.planMemberCreate).toHaveBeenCalledWith({
      data: {
        planId: PLAN_ID,
        userId: FRIEND_USER_ID,
      },
    });
    expect(mocks.includeMemberInPastExpenses).toHaveBeenCalledWith(
      expect.objectContaining({
        planMember: { create: mocks.planMemberCreate },
      }),
      { planId: PLAN_ID, memberId: NEW_MEMBER_ID },
    );
  });
});

describe("addGhostToPlan", () => {
  const NEW_GHOST_ID = "pm-new-ghost";

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.planFindFirst.mockResolvedValue(makePlan());
    mocks.planMemberFindUnique.mockResolvedValue(null);
    mocks.planMemberCreate.mockResolvedValue({ id: NEW_GHOST_ID });
    mocks.includeMemberInPastExpenses.mockResolvedValue(undefined);
    mocks.transaction.mockImplementation(
      async (callback: (tx: unknown) => unknown) =>
        callback({
          planMember: { create: mocks.planMemberCreate },
        }),
    );
  });

  it("opción A crea el invitado y no toca gastos", async () => {
    await addGhostToPlan({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      ghostName: "Carla",
      includeInPastExpenses: false,
    });

    expect(mocks.planMemberCreate).toHaveBeenCalledWith({
      data: {
        planId: PLAN_ID,
        ghostName: "Carla",
        ghostNameNormalized: "carla",
      },
    });
    expect(mocks.includeMemberInPastExpenses).not.toHaveBeenCalled();
  });

  it("opción B incluye al invitado en los gastos pasados", async () => {
    await addGhostToPlan({
      actorUserId: CREATOR_ID,
      planId: PLAN_ID,
      ghostName: "Carla",
      includeInPastExpenses: true,
    });

    expect(mocks.includeMemberInPastExpenses).toHaveBeenCalledWith(
      expect.anything(),
      { planId: PLAN_ID, memberId: NEW_GHOST_ID },
    );
  });
});
